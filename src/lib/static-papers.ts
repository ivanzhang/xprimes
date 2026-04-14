export interface StaticPaper {
  filename: string;
  title: string;
  category: string;
  method: string;
}

export const STATIC_PAPERS: readonly StaticPaper[] = [
  {
    filename: "[张友沛]分布刚性原理：素数分布与动力系统的统一数学理论.pdf",
    title: "分布刚性原理：素数分布与动力系统的统一数学理论",
    category: "综合理论 · 核心框架",
    method: "分布刚性原理",
  },
  {
    filename: "分布刚性原理：一个统一的数学世界观.pdf",
    title: "分布刚性原理：一个统一的数学世界观",
    category: "数理哲学",
    method: "分布刚性原理",
  },
  {
    filename: "素数分布的本质与数理哲学的领悟.pdf",
    title: "素数分布的本质与数理哲学的领悟",
    category: "数理哲学",
    method: "分布刚性原理",
  },
  {
    filename: "局部-整体对偶与黎曼猜想的研究论证.pdf",
    title: "局部-整体对偶与黎曼猜想的研究论证",
    category: "黎曼猜想",
    method: "分布刚性原理",
  },
  {
    filename: "递归剥离动力系统与 Cramér 猜想的研究论证.pdf",
    title: "递归剥离动力系统与 Cramér 猜想的研究论证",
    category: "Cramér 猜想",
    method: "递归剥离动力系统",
  },
  {
    filename: "递归剥离动力系统与考拉兹猜想的研究论证.pdf",
    title: "递归剥离动力系统与考拉兹猜想的研究论证",
    category: "考拉兹猜想",
    method: "递归剥离动力系统",
  },
  {
    filename: "递归剥离动力系统与林尼克定理最小指数的研究论证.pdf",
    title: "递归剥离动力系统与林尼克定理最小指数的研究论证",
    category: "林尼克定理",
    method: "递归剥离动力系统",
  },
  {
    filename: "方阵几何斜线映射与勒让德猜想的研究论证.pdf",
    title: "方阵几何斜线映射与勒让德猜想的研究论证",
    category: "勒让德猜想",
    method: "方阵几何斜线映射",
  },
  {
    filename: "方阵几何斜线映射与孪生素数猜想的研究论证.pdf",
    title: "方阵几何斜线映射与孪生素数猜想的研究论证",
    category: "孪生素数猜想",
    method: "方阵几何斜线映射",
  },
  {
    filename: "方阵几何斜线映射与哥德巴赫猜想的研究论证.pdf",
    title: "方阵几何斜线映射与哥德巴赫猜想的研究论证",
    category: "哥德巴赫猜想",
    method: "方阵几何斜线映射",
  },
] as const;
