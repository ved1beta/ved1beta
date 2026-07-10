"""
Regenerates the stats baked into dark_mode.svg / light_mode.svg.

Adapted from Andrew6rant/Andrew6rant (today.py), with the birthday-based
"Uptime" replaced by GitHub account age and the deleted-repo archive removed.

Fine-grained PAT with All Repositories access:
  Account permissions:    read:Followers, read:Starring
  Repository permissions: read:Contents, read:Metadata
"""
import datetime
import hashlib
import os
import time

import requests
from dateutil import relativedelta
from lxml import etree

TOKEN = os.environ.get('ACCESS_TOKEN', '').strip()
if not TOKEN:
    raise SystemExit(
        'ACCESS_TOKEN is unset or empty.\n'
        'Add it under Settings > Secrets and variables > Actions > '
        '"Repository secrets" -- a *secret*, not a variable, and not an '
        'Environment secret unless the job declares that environment.')

USER_NAME = os.environ.get('USER_NAME', '').strip()
if not USER_NAME:
    raise SystemExit('USER_NAME is unset or empty.')

HEADERS = {'authorization': 'token ' + TOKEN}
COMMENT_SIZE = 7
QUERY_COUNT = {'user_getter': 0, 'follower_getter': 0, 'graph_repos_stars': 0,
               'recursive_loc': 0, 'graph_commits': 0, 'loc_query': 0}

# Reserved value widths, tuned so every right-column line renders at exactly 60
# chars. Two fill styles, and a field's style is not interchangeable:
#   dots  -- run is (gap + 2) wide, and only when gap > 2 (see justify_format)
#   space -- run is (length - len(value)) wide, so field width is exactly `length`
# Values longer than their reservation grow the line rather than truncating.
LEN_AGE = 49          # dots
LEN_REPO = 6          # dots
LEN_CONTRIB = 5       # space -- inside {braces}, dots would read as noise
LEN_STAR = 13         # dots
LEN_COMMIT = 23       # dots
LEN_FOLLOWER = 10     # dots
# The LOC line's three fields share a 23-char budget (37 chars are static text),
# so it cannot hold three 9-char values; past ~1M lines it grows wider than 60.
LEN_LOC = 8           # space
LEN_LOC_ADD = 8       # space
LEN_LOC_DEL = 7       # space


def format_plural(unit):
    return 's' if unit != 1 else ''


def account_age(created_at):
    """'X years, Y months, Z days' since the GitHub account was created."""
    diff = relativedelta.relativedelta(datetime.datetime.today(), created_at)
    return '{} {}, {} {}, {} {}'.format(
        diff.years, 'year' + format_plural(diff.years),
        diff.months, 'month' + format_plural(diff.months),
        diff.days, 'day' + format_plural(diff.days))


def query_count(funct_id):
    QUERY_COUNT[funct_id] += 1


PERM_HINT = (
    'The token authenticated but is not allowed to read this.\n'
    'A fine-grained PAT needs: Repository access = All repositories; '
    'Repository permissions = Contents:read, Metadata:read; '
    'Account permissions = Followers:read, Starring:read.\n'
    'Org-owned repos also require the org to approve the token.'
)


RETRY_STATUS = (502, 503, 504)
RETRY_TRIES = 5


def post_graphql(query, variables):
    """POST a query, retrying transient 5xx with exponential backoff.

    Walking a large repo's commit history for additions/deletions is heavy
    enough that GitHub's backend intermittently 502s. These are transient, so
    a bare failure throws away an entire run's work over one bad response.
    """
    delay = 2
    for attempt in range(1, RETRY_TRIES + 1):
        try:
            r = requests.post('https://api.github.com/graphql',
                              json={'query': query, 'variables': variables},
                              headers=HEADERS, timeout=60)
        except requests.exceptions.RequestException as exc:
            if attempt == RETRY_TRIES:
                raise
            print(f'   network error ({exc.__class__.__name__}), '
                  f'retry {attempt}/{RETRY_TRIES - 1} in {delay}s')
            time.sleep(delay)
            delay *= 2
            continue
        if r.status_code in RETRY_STATUS and attempt < RETRY_TRIES:
            print(f'   HTTP {r.status_code}, retry {attempt}/{RETRY_TRIES - 1} '
                  f'in {delay}s')
            time.sleep(delay)
            delay *= 2
            continue
        return r
    return r


FATAL_ERRORS = {'FORBIDDEN', 'INSUFFICIENT_SCOPES', 'UNAUTHORIZED', 'NOT_FOUND'}
_WARNED = set()


def check_graphql(func_name, payload):
    """Raise on fatal GraphQL errors; tolerate per-field ones.

    GraphQL answers HTTP 200 for everything. A permission failure comes back as
    errors + data:null -- unhandled, that null propagates and dies later as an
    opaque "'NoneType' object is not subscriptable".

    But `errors` is also used for per-field problems that leave `data` perfectly
    usable, e.g. "The deletions count for this commit is unavailable" on commits
    too large for GitHub to diff. Those must not abort the run.
    """
    errors = payload.get('errors')
    data = payload.get('data')
    if errors:
        kinds = {e.get('type') for e in errors}
        msgs = '; '.join(e.get('message', '?') for e in errors)
        if data is None or kinds & FATAL_ERRORS:
            hint = f'\n{PERM_HINT}' if kinds & {'FORBIDDEN', 'INSUFFICIENT_SCOPES'} else ''
            raise Exception(f'{func_name}: GraphQL errors: {msgs}{hint}')
        if msgs not in _WARNED:      # partial data -- note it once, keep going
            _WARNED.add(msgs)
            print(f'   note: {func_name}: {msgs}')
        return payload
    if data is None:
        raise Exception(f'{func_name}: GraphQL returned no data.\n{PERM_HINT}')
    return payload


def simple_request(func_name, query, variables):
    r = post_graphql(query, variables)
    if r.status_code == 200:
        check_graphql(func_name, r.json())
        return r
    if r.status_code == 401:
        raise Exception(f'{func_name}: 401 Unauthorized -- ACCESS_TOKEN is invalid, '
                        f'revoked, or expired.')
    if r.status_code == 403:
        raise Exception(f'{func_name}: 403 Forbidden.\n{PERM_HINT}\n'
                        f'(A 403 partway through a long run instead means the '
                        f'undocumented anti-abuse rate limit tripped.)')
    raise Exception(func_name, 'has failed with a', r.status_code, r.text, QUERY_COUNT)


def user_getter(username):
    query_count('user_getter')
    query = '''
    query($login: String!){
        user(login: $login) { id createdAt }
    }'''
    r = simple_request(user_getter.__name__, query, {'login': username})
    return {'id': r.json()['data']['user']['id']}, r.json()['data']['user']['createdAt']


def follower_getter(username):
    query_count('follower_getter')
    query = '''
    query($login: String!){
        user(login: $login) { followers { totalCount } }
    }'''
    r = simple_request(follower_getter.__name__, query, {'login': username})
    return int(r.json()['data']['user']['followers']['totalCount'])


def graph_repos_stars(count_type, owner_affiliation, cursor=None):
    query_count('graph_repos_stars')
    query = '''
    query ($owner_affiliation: [RepositoryAffiliation], $login: String!, $cursor: String) {
        user(login: $login) {
            repositories(first: 100, after: $cursor, ownerAffiliations: $owner_affiliation) {
                totalCount
                edges { node { ... on Repository { nameWithOwner stargazers { totalCount } } } }
                pageInfo { endCursor hasNextPage }
            }
        }
    }'''
    variables = {'owner_affiliation': owner_affiliation, 'login': USER_NAME, 'cursor': cursor}
    r = simple_request(graph_repos_stars.__name__, query, variables)
    repos = r.json()['data']['user']['repositories']
    if count_type == 'repos':
        return repos['totalCount']
    if count_type == 'stars':
        return stars_counter(repos['edges'])


def stars_counter(data):
    return sum(node['node']['stargazers']['totalCount'] for node in data)


# 100 commits/page makes GitHub 502 on deep histories -- asking for per-commit
# additions/deletions is the expensive part. 50 costs more round-trips but each
# one returns. Page count is why this iterates rather than recurses: one frame
# per page overflowed the stack on repos with thousands of commits.
HISTORY_QUERY = '''
    query ($repo_name: String!, $owner: String!, $cursor: String) {
        repository(name: $repo_name, owner: $owner) {
            defaultBranchRef { target { ... on Commit {
                history(first: 50, after: $cursor) {
                    totalCount
                    edges { node { ... on Commit { committedDate }
                        author { user { id } } deletions additions } }
                    pageInfo { endCursor hasNextPage }
                }
            } } }
        }
    }'''


def recursive_loc(owner, repo_name, data, cache_comment):
    """Total (additions, deletions, commits) authored by OWNER_ID in one repo."""
    additions = deletions = my_commits = 0
    cursor = None
    while True:
        query_count('recursive_loc')
        r = post_graphql(HISTORY_QUERY,
                         {'repo_name': repo_name, 'owner': owner, 'cursor': cursor})
        if r.status_code != 200:
            force_close_file(data, cache_comment)
            if r.status_code == 403:
                raise Exception('Too many requests in a short amount of time!\n'
                                'You\'ve hit the non-documented anti-abuse limit!')
            raise Exception('recursive_loc() has failed with a', r.status_code,
                            r.text, QUERY_COUNT)

        payload = r.json()
        try:
            check_graphql('recursive_loc', payload)
        except Exception:
            force_close_file(data, cache_comment)  # save progress before raising
            raise

        branch = payload['data']['repository']['defaultBranchRef']
        if branch is None:          # empty repo
            return 0, 0, 0
        history = branch['target']['history']

        for edge in history['edges']:
            node = edge['node']
            # `author` is null for commits with no Git identity; `additions` and
            # `deletions` are null on commits GitHub declines to diff (the
            # "count for this commit is unavailable" error above).
            author = node.get('author') or {}
            if author.get('user') == OWNER_ID:
                my_commits += 1
                additions += node['additions'] or 0
                deletions += node['deletions'] or 0

        if not history['edges'] or not history['pageInfo']['hasNextPage']:
            return additions, deletions, my_commits
        cursor = history['pageInfo']['endCursor']


def loc_query(owner_affiliation, comment_size=0, force_cache=False):
    """Walk every accessible repo (60 at a time -- larger pages 502)."""
    query = '''
    query ($owner_affiliation: [RepositoryAffiliation], $login: String!, $cursor: String) {
        user(login: $login) {
            repositories(first: 60, after: $cursor, ownerAffiliations: $owner_affiliation) {
                edges { node { ... on Repository { nameWithOwner
                    defaultBranchRef { target { ... on Commit { history { totalCount } } } } } } }
                pageInfo { endCursor hasNextPage }
            }
        }
    }'''
    edges, cursor = [], None
    while True:
        query_count('loc_query')
        variables = {'owner_affiliation': owner_affiliation, 'login': USER_NAME,
                     'cursor': cursor}
        r = simple_request(loc_query.__name__, query, variables)
        repos = r.json()['data']['user']['repositories']
        edges += repos['edges']
        if not repos['pageInfo']['hasNextPage']:
            return cache_builder(edges, comment_size, force_cache)
        cursor = repos['pageInfo']['endCursor']


def cache_filename():
    return 'cache/' + hashlib.sha256(USER_NAME.encode('utf-8')).hexdigest() + '.txt'


def cache_builder(edges, comment_size, force_cache, loc_add=0, loc_del=0):
    """Only re-count a repo's LOC when its commit total changed since last run."""
    cached = True
    os.makedirs('cache', exist_ok=True)
    filename = cache_filename()
    try:
        with open(filename, 'r') as f:
            data = f.readlines()
    except FileNotFoundError:
        data = ['This line is a comment block. Write whatever you want here.\n'] * comment_size
        with open(filename, 'w') as f:
            f.writelines(data)

    if len(data) - comment_size != len(edges) or force_cache:
        cached = False
        flush_cache(edges, filename, comment_size)
        with open(filename, 'r') as f:
            data = f.readlines()

    cache_comment = data[:comment_size]
    data = data[comment_size:]
    for index in range(len(edges)):
        repo_hash, commit_count, *__ = data[index].split()
        expected = hashlib.sha256(edges[index]['node']['nameWithOwner'].encode('utf-8')).hexdigest()
        if repo_hash == expected:
            try:
                history = edges[index]['node']['defaultBranchRef']['target']['history']
                if int(commit_count) != history['totalCount']:
                    owner, repo_name = edges[index]['node']['nameWithOwner'].split('/')
                    loc = recursive_loc(owner, repo_name, data, cache_comment)
                    data[index] = (f"{repo_hash} {history['totalCount']} "
                                   f"{loc[2]} {loc[0]} {loc[1]}\n")
            except TypeError:  # empty repo
                data[index] = repo_hash + ' 0 0 0 0\n'
    with open(filename, 'w') as f:
        f.writelines(cache_comment)
        f.writelines(data)
    for line in data:
        loc = line.split()
        loc_add += int(loc[3])
        loc_del += int(loc[4])
    return [loc_add, loc_del, loc_add - loc_del, cached]


def flush_cache(edges, filename, comment_size):
    with open(filename, 'r') as f:
        data = f.readlines()[:comment_size] if comment_size > 0 else []
    with open(filename, 'w') as f:
        f.writelines(data)
        for node in edges:
            f.write(hashlib.sha256(
                node['node']['nameWithOwner'].encode('utf-8')).hexdigest() + ' 0 0 0 0\n')


def force_close_file(data, cache_comment):
    """Persist partial progress so a crash doesn't corrupt the cache."""
    filename = cache_filename()
    with open(filename, 'w') as f:
        f.writelines(cache_comment)
        f.writelines(data)
    print('Partial data saved to', filename)


def commit_counter(comment_size):
    total = 0
    with open(cache_filename(), 'r') as f:
        data = f.readlines()[comment_size:]
    for line in data:
        total += int(line.split()[2])
    return total


def svg_overwrite(filename, age_data, commit_data, star_data, repo_data,
                  contrib_data, follower_data, loc_data):
    tree = etree.parse(filename)
    root = tree.getroot()
    justify_format(root, 'age_data', age_data, LEN_AGE)
    justify_format(root, 'commit_data', commit_data, LEN_COMMIT)
    justify_format(root, 'star_data', star_data, LEN_STAR)
    justify_format(root, 'repo_data', repo_data, LEN_REPO)
    justify_format(root, 'follower_data', follower_data, LEN_FOLLOWER)
    pad_format(root, 'contrib_data', contrib_data, LEN_CONTRIB)
    pad_format(root, 'loc_data', loc_data[2], LEN_LOC)
    pad_format(root, 'loc_add', loc_data[0], LEN_LOC_ADD)
    pad_format(root, 'loc_del', loc_data[1], LEN_LOC_DEL)
    tree.write(filename, encoding='utf-8', xml_declaration=True)


def comma(new_text):
    return f"{'{:,}'.format(new_text)}" if isinstance(new_text, int) else str(new_text)


def justify_format(root, element_id, new_text, length=0):
    """Set the value, then size the preceding dot run so the line stays 60 chars.

    The run is (gap + 2) wide, collapsing to a literal 0/1/2 chars once the gap
    is small -- so a field only holds its width while `length - len(value)` > 2.
    """
    new_text = comma(new_text)
    find_and_replace(root, element_id, new_text)
    just_len = max(0, length - len(new_text))
    if just_len <= 2:
        dot_string = {0: '', 1: ' ', 2: '. '}[just_len]
    else:
        dot_string = ' ' + ('.' * just_len) + ' '
    find_and_replace(root, f'{element_id}_dots', dot_string)


def pad_format(root, element_id, new_text, length):
    """Right-align the value in `length` chars using a leading space run.

    Unlike justify_format the field is exactly `length` wide for any value that
    fits, so it is safe where dots would look wrong (inside braces) or where the
    line has no dotted field left to absorb the slack.
    """
    new_text = comma(new_text)
    find_and_replace(root, element_id, new_text)
    find_and_replace(root, f'{element_id}_dots', ' ' * max(0, length - len(new_text)))


def find_and_replace(root, element_id, new_text):
    element = root.find(f".//*[@id='{element_id}']")
    if element is not None:
        element.text = new_text


def perf_counter(funct, *args):
    start = time.perf_counter()
    return funct(*args), time.perf_counter() - start


def formatter(query_type, difference):
    print('{:<23}'.format('   ' + query_type + ':'), sep='', end='')
    print('{:>12}'.format('%.4f' % difference + ' s ') if difference > 1
          else '{:>12}'.format('%.4f' % (difference * 1000) + ' ms'))


if __name__ == '__main__':
    print('Calculation times:')
    user_data, user_time = perf_counter(user_getter, USER_NAME)
    OWNER_ID, acc_date = user_data
    formatter('account data', user_time)

    created = datetime.datetime.strptime(acc_date, '%Y-%m-%dT%H:%M:%SZ')
    age_data, age_time = perf_counter(account_age, created)
    formatter('age calculation', age_time)

    ALL = ['OWNER', 'COLLABORATOR', 'ORGANIZATION_MEMBER']
    total_loc, loc_time = perf_counter(loc_query, ALL, COMMENT_SIZE)
    formatter('LOC (cached)' if total_loc[-1] else 'LOC (no cache)', loc_time)

    commit_data, commit_time = perf_counter(commit_counter, COMMENT_SIZE)
    star_data, star_time = perf_counter(graph_repos_stars, 'stars', ['OWNER'])
    repo_data, repo_time = perf_counter(graph_repos_stars, 'repos', ['OWNER'])
    contrib_data, contrib_time = perf_counter(graph_repos_stars, 'repos', ALL)
    follower_data, follower_time = perf_counter(follower_getter, USER_NAME)

    for index in range(len(total_loc) - 1):
        total_loc[index] = '{:,}'.format(total_loc[index])

    for svg in ('dark_mode.svg', 'light_mode.svg'):
        svg_overwrite(svg, age_data, commit_data, star_data, repo_data,
                      contrib_data, follower_data, total_loc[:-1])

    print('Total GitHub GraphQL API calls:', '{:>3}'.format(sum(QUERY_COUNT.values())))
    for funct_name, count in QUERY_COUNT.items():
        print('{:<28}'.format('   ' + funct_name + ':'), '{:>6}'.format(count))
