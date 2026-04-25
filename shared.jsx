// Shared data + primitives for all variations

const SITE = {
  name: "Ved",
  handle: "ved1beta",
  role: "Systems engineer",
  company: "Axolotl AI",
  location: "Remote",
  blurb: "Distributed training, inference, and the seams between them. Contributor to pytorch/ao, bitsandbytes, Axolotl, PEFT, and tt-mlir. Most of my work is a small diff at the interface between two libraries whose authors weren't imagining each other.",
  x: "@ant_vedaya",
  github: "ved1beta",
  email: "ved@axolotl.ai",
};

const PRS = [
  { repo: "pytorch/ao",                  num: 3644, title: "add support for MXFP8 and MXFP4 QAT",        state: "merged",  date: "2026-03",   role: "Contributor", tag: "prototype",
    featured: true, area: "quantization",
    summary: "Added the MX-family QAT path — MXFP4 and MXFP8 (E4M3, E5M2) — through pytorch/ao's existing quantize_ API; first-class fake-quant modules so QAT and PTQ share kernels." },
  { repo: "bitsandbytes-foundation/bnb", num: 1840, title: "fix 8bitoptim support with fsdp",             state: "merged",  date: "2026-02",   role: "Contributor", tag: "release v0.49.2",
    featured: true, area: "distributed training",
    summary: "Closed a 4-year-old issue: bnb's 8-bit optimizer now works under FSDP. The fix is a one-level dict re-nest — the bug lived at the seam between two libraries that didn't agree on a contract." },
  { repo: "axolotl-ai-cloud/axolotl",    num: 3375, title: "add: support mxfp4 axo",                     state: "merged",  date: "2026-03-06",role: "Member",      tag: "mxfp4",
    featured: true, area: "training framework",
    summary: "End-user MXFP4 QAT support — three YAML lines and a Llama trains with simulated 4-bit numerics on a consumer GPU. Closes the loop from torchao primitive to runnable recipe." },
  { repo: "huggingface/peft",            num: 3199, title: "fix aux4 kwargs-only modules in modules_to_save", state: "merged", date: "2026-04", role: "Contributor", tag: "peft" },
  { repo: "axolotl-ai-cloud/axolotl",    num: 3609, title: "fix fsdp shard dict saving and reload",      state: "closed",  date: "2026-04",   role: "Member",      tag: "fsdp" },
  { repo: "ved1beta/Quanta",             num: 7,    title: "beating bnb on int8 quantize",               state: "merged",  date: "2026-04",   role: "Owner",       tag: "quanta",
    featured: true, area: "inference",
    summary: "Quanta v0.2 — own quantization library for PyTorch. ~1.5× faster int8 quantize and 33% lower round-trip MAE vs bitsandbytes; Triton kernels for blockwise NF4/FP4 + benchmark suite." },
  { repo: "tenstorrent/tt-mlir",         num: 5395, title: "add element wise binary ops",                state: "closed",  date: "2026-04",   role: "Contributor", tag: "community",
    featured: true, area: "compiler / serving",
    summary: "Element-wise binary ops in Tenstorrent's MLIR compiler — broader op coverage so PyTorch graphs lower cleanly to TT hardware. Cross-stack inference work outside the PyTorch ecosystem." },
  { repo: "axolotl-ai-cloud/axolotl",    num: 3553, title: "MX QAT patch",                               state: "merged",  date: "2026-03",   role: "Member",      tag: "scheduled_release" },
  { repo: "axolotl-ai-cloud/axolotl",    num: 3554, title: "qwen3.5 configs",                            state: "merged",  date: "2026-03",   role: "Member",      tag: "configs" },
  { repo: "axolotl-ai-cloud/axolotl",    num: 3508, title: "super nemo support",                         state: "merged",  date: "2026-03",   role: "Member",      tag: "scheduled_release" },
  { repo: "axolotl-ai-cloud/axolotl",    num: 3095, title: "merge-lora iterate through bins without loading", state: "merged", date: "2026-03-25", role: "Member",    tag: "lora" },
  { repo: "axolotl-ai-cloud/axolotl",    num: 3392, title: "move rollout in set_training_kwargs",        state: "merged",  date: "2026-02-10",role: "Member",      tag: "bug" },
  { repo: "axolotl-ai-cloud/axolotl",    num: 3382, title: "fix: saving state dict and eval for Context Parallel", state: "merged", date: "2026-02-10", role: "Member", tag: "fix",
    featured: true, area: "distributed training",
    summary: "State-dict saving + eval correctness under Context Parallel — unlocked CP for production fine-tunes that previously crashed mid-epoch on the eval pass." },
  { repo: "axolotl-ai-cloud/axolotl",    num: 3364, title: "train_per_sec_per_gpu metric",               state: "merged",  date: "2026-02-10",role: "Member",      tag: "metrics" },
  { repo: "axolotl-ai-cloud/axolotl",    num: 3329, title: "add glm support + patch",                    state: "merged",  date: "2026-02-10",role: "Member",      tag: "configs" },
  { repo: "axolotl-ai-cloud/axolotl",    num: 3302, title: "add liger kernel support for dpo",           state: "merged",  date: "2025-12-18",role: "Member",      tag: "dpo" },
  { repo: "axolotl-ai-cloud/axolotl",    num: 3233, title: "feat: save checkpoint after training started", state: "merged", date: "2025-11-13", role: "Member",     tag: "ready to merge" },
  { repo: "axolotl-ai-cloud/axolotl",    num: 3478, title: "fix: high eval loss w/ sample packing",      state: "merged",  date: "2026-03-16",role: "Member",      tag: "fix" },
  { repo: "axolotl-ai-cloud/axolotl",    num: 3483, title: "moe quant patch for merge mismatch",         state: "merged",  date: "2026-03-16",role: "Member",      tag: "quant" },
  { repo: "axolotl-ai-cloud/axolotl",    num: 3442, title: "add: qwen 3.5",                              state: "merged",  date: "2026-03-06",role: "Member",      tag: "under review" },
];

const WORK = [
  { who: "Axolotl AI", role: "Systems Engineer", when: "2025 — present", what: "Quantization, distributed training, and the fine-tuning-to-serving pipeline. MXFP4 QAT, FSDP interop, bitsandbytes fixes." },
  { who: "Open source",  role: "Contributor",       when: "2024 — present", what: "pytorch/ao, bitsandbytes, transformers, PEFT, tt-mlir. Mostly at the seams between libraries." },
];

const PROJECTS = [
  {
    name: "Quanta",
    sub: "lightweight quantization primitives for PyTorch",
    desc: "int8 / int4 / NF4 / FP4 / NF8 / FP8 in one consistent API. Triton kernels for blockwise NF4/FP4 encode-decode and fused 4-bit weight matmul; torch._int_mm for int8 Linear on CUDA. Benchmarks vs bitsandbytes: ~1.5× faster int8 quantize, 33% lower round-trip error; bnb still ahead on 4-bit Linear forward.",
    repo: "ved1beta/Quanta",
    url:  "https://github.com/ved1beta/Quanta",
    stack: "PyTorch · Triton · CUDA",
  },
  {
    name: "GPU-sanghathan",
    sub: "distributed training, from scratch",
    desc: "A POC for distributed training of sequential deep-learning models, written in pure NumPy + mpi4py. Implements DistributedDataParallel-style interleaved comm/compute, plus Gpipe pipeline parallelism with FWD/BWD interleaving. Any combination of DP × PP from a single CLI flag — a readable trace of how PyTorch's distributed primitives actually work underneath.",
    repo: "ved1beta/GPU-sanghathan",
    url:  "https://github.com/ved1beta/GPU-sanghathan",
    stack: "NumPy · MPI · DDP · Gpipe",
  },
  {
    name: "CUDA_MLpapers",
    sub: "canonical ML papers, re-implemented in CUDA",
    desc: "From-scratch CUDA implementations of seminal attention and memory-optimization papers — online softmax, FlashAttention, Llama-2 attention, ALiBi linear-bias, gated SDPA, KV-cache + MQA. Each kernel is short, focused, and runnable; the reading-list-as-code repo I keep open while reading new papers.",
    repo: "ved1beta/CUDA_MLpapers",
    url:  "https://github.com/ved1beta/CUDA_MLpapers",
    stack: "CUDA · attention · kv-cache",
  },
];

const POSTS = [
  {
    slug: "mxfp4-end-to-end",
    title: "MXFP4, End-to-End",
    sub: "How a 4-bit recipe travels from pytorch/ao to Axolotl",
    date: "2026-04-18",
    read: "14 min",
    tags: ["quantization", "qat", "systems"],
    featured: true,
  },
  {
    slug: "engram",
    title: "Engram: Conditional Memory via Scalable Lookup",
    sub: "DeepSeek's answer to the second sparsity problem — the one MoE didn't touch",
    date: "2026-04-22",
    read: "12 min",
    tags: ["deepseek", "memory", "architecture"],
  },
];

const NOW = [
  "Debugging PTQ for MXFP4 (axolotl#3539 / #3581).",
  "Reading the TorchAO paper end-to-end, third pass.",
  "Benchmarking NVFP4 on Blackwell once hardware frees up.",
  "On the side: a tiny W4A8 inference runtime called Quanta.",
];

// --- Primitives ---
function Tag({ children, accent }) {
  return (
    <span style={{
      fontFamily: "var(--mono)",
      fontSize: 10,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      padding: "3px 7px",
      border: "1px solid var(--border)",
      borderRadius: 3,
      color: accent ? "var(--accent)" : "var(--muted)",
      borderColor: accent ? "color-mix(in oklab, var(--accent) 40%, transparent)" : "var(--border)",
      background: accent ? "color-mix(in oklab, var(--accent) 8%, transparent)" : "transparent",
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function Dot({ color = "var(--accent)" }) {
  return <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 999, background: color, verticalAlign: "middle" }} />;
}

function Divider() {
  return <div style={{ height: 1, background: "var(--border)", width: "100%" }} />;
}

function Placeholder({ label, h = 160 }) {
  return (
    <div style={{
      height: h,
      borderRadius: 4,
      border: "1px solid var(--border)",
      backgroundImage: "repeating-linear-gradient(45deg, transparent 0 10px, color-mix(in oklab, var(--fg) 3%, transparent) 10px 11px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 0.5,
    }}>{label}</div>
  );
}

Object.assign(window, { SITE, PRS, WORK, PROJECTS, POSTS, NOW, Tag, Dot, Divider, Placeholder });
