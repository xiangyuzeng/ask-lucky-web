import { useTranslation } from "../../i18n";
import { useDepartment } from "../../contexts/DepartmentContext";
import { departments } from "../../data/departments";
import type { DepartmentId } from "../../types/department";

interface DepartmentQuickActionsProps {
  onActionClick: (prompt: string) => void;
}

// Quick action prompts for each department
const quickActionPrompts: Record<
  Exclude<DepartmentId, "general">,
  [string, string, string]
> = {
  marketing: [
    "生成本月营销活动的ROI分析报告，包括各渠道的转化率和获客成本对比。",
    "分析我们的客户数据，按购买频率和消费金额进行细分，识别高价值客户群体。",
    "对比我们与主要竞争对手在定价、促销和市场定位方面的差异。",
  ],
  accounting: [
    "生成本月的财务报表，包括营收、成本和利润的详细分析。",
    "分析本季度的费用支出，识别超出预算的项目并提供优化建议。",
    "查询当前的现金流状况，包括应收账款和应付账款的详细信息。",
  ],
  devops: [
    "检查所有系统的当前状态，包括CPU、内存、磁盘使用率和服务健康状况。",
    "分析过去24小时的系统日志，识别错误和异常模式。",
    "分析各服务的性能指标，识别瓶颈并提供优化建议。",
  ],
  product: [
    "分析用户行为数据，包括活跃用户数、留存率和使用时长趋势。",
    "展示各功能的使用情况，识别最受欢迎和使用率低的功能。",
    "汇总最近的用户反馈和评价，按主题分类并识别改进机会。",
  ],
  supplyChain: [
    "查询当前各仓库的库存水平，标记低于安全库存的商品。",
    "评估主要供应商的绩效，包括交货准时率、质量和成本趋势。",
    "追踪当前在途订单的物流状态，识别可能延迟的配送。",
  ],
  executive: [
    "生成公司整体业绩总览，包括营收、利润和关键业务指标。",
    "展示各部门的KPI完成情况，标注超额完成和未达标的指标。",
    "评估当前面临的主要风险，包括运营、财务和市场风险。",
  ],
};

export function DepartmentQuickActions({
  onActionClick,
}: DepartmentQuickActionsProps) {
  const { t } = useTranslation();
  const { department } = useDepartment();

  // Don't show for general department
  if (department === "general") {
    return null;
  }

  const currentDept = departments[department];
  const prompts = quickActionPrompts[department];

  const actions = [
    { key: "action1", prompt: prompts[0] },
    { key: "action2", prompt: prompts[1] },
    { key: "action3", prompt: prompts[2] },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {actions.map(({ key, prompt }) => (
        <button
          key={key}
          onClick={() => onActionClick(prompt)}
          className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
          style={{
            backgroundColor: `${currentDept.color}15`,
            color: currentDept.color,
            border: `1px solid ${currentDept.color}30`,
          }}
        >
          {t(`quickActions.${department}.${key}`)}
        </button>
      ))}
    </div>
  );
}
