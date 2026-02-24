import type { DepartmentId } from "../types/department";

export interface PromptTemplate {
  id: string;
  department: DepartmentId;
  titleKey: string;
  prompt: string;
}

export const promptTemplates: PromptTemplate[] = [
  // Marketing 市场营销 (10 templates)
  {
    id: "mkt-1",
    department: "marketing",
    titleKey: "营销活动ROI分析",
    prompt:
      "分析我们最近营销活动的投资回报率。展示转化率和获客成本排名前5的活动。",
  },
  {
    id: "mkt-2",
    department: "marketing",
    titleKey: "客户细分分析",
    prompt: "根据购买频率、平均订单金额和产品偏好生成客户细分分析报告。",
  },
  {
    id: "mkt-3",
    department: "marketing",
    titleKey: "社交媒体指标",
    prompt:
      "提取过去一个月的社交媒体互动指标。对比各平台表现并识别表现最佳的内容。",
  },
  {
    id: "mkt-4",
    department: "marketing",
    titleKey: "竞争对手分析",
    prompt: "提供主要竞争对手的定价、促销和市场定位的竞争分析报告。",
  },
  {
    id: "mkt-5",
    department: "marketing",
    titleKey: "邮件营销效果",
    prompt: "展示上季度邮件营销活动的效果指标，包括打开率、点击率和转化率。",
  },
  {
    id: "mkt-6",
    department: "marketing",
    titleKey: "客户生命周期价值",
    prompt: "按获客渠道计算客户生命周期价值，并识别最有价值的客户群体。",
  },
  {
    id: "mkt-7",
    department: "marketing",
    titleKey: "促销活动效果评估",
    prompt:
      "评估本月所有促销活动的效果，包括销售提升、参与人数和成本效益分析。",
  },
  {
    id: "mkt-8",
    department: "marketing",
    titleKey: "会员增长趋势",
    prompt: "分析会员增长趋势，包括新增会员数、活跃会员比例和会员流失率。",
  },
  {
    id: "mkt-9",
    department: "marketing",
    titleKey: "品牌认知度分析",
    prompt: "分析品牌认知度数据，包括品牌提及量、情感分析和与竞品的对比。",
  },
  {
    id: "mkt-10",
    department: "marketing",
    titleKey: "渠道转化率对比",
    prompt: "对比各营销渠道的转化率，识别最高效的获客渠道并提供优化建议。",
  },

  // Accounting 财务会计 (10 templates)
  {
    id: "acc-1",
    department: "accounting",
    titleKey: "月度营收报告",
    prompt: "生成按门店位置、产品类别和支付方式分类的月度营收报告。",
  },
  {
    id: "acc-2",
    department: "accounting",
    titleKey: "费用分析",
    prompt: "分析本季度的运营费用。识别与预算相比的任何异常差异。",
  },
  {
    id: "acc-3",
    department: "accounting",
    titleKey: "现金流预测",
    prompt: "根据当前应收账款、应付账款和预期销售额创建90天现金流预测。",
  },
  {
    id: "acc-4",
    department: "accounting",
    titleKey: "应收账款账龄",
    prompt: "展示应收账款账龄报告。标注任何超过60天逾期的账户。",
  },
  {
    id: "acc-5",
    department: "accounting",
    titleKey: "预算差异分析",
    prompt: "对所有部门进行预算差异分析。标记任何超过10%的差异。",
  },
  {
    id: "acc-6",
    department: "accounting",
    titleKey: "门店盈利分析",
    prompt: "分析各门店的盈利情况，包括营收、成本和利润率对比。",
  },
  {
    id: "acc-7",
    department: "accounting",
    titleKey: "成本结构分析",
    prompt: "分析公司整体成本结构，识别主要成本驱动因素和优化机会。",
  },
  {
    id: "acc-8",
    department: "accounting",
    titleKey: "税务合规检查",
    prompt: "检查税务合规情况，包括增值税申报、企业所得税和其他税务事项。",
  },
  {
    id: "acc-9",
    department: "accounting",
    titleKey: "财务健康指标",
    prompt: "生成财务健康指标报告，包括流动比率、速动比率和资产负债率。",
  },
  {
    id: "acc-10",
    department: "accounting",
    titleKey: "跨期对比分析",
    prompt: "进行同比和环比财务数据对比分析，识别增长趋势和异常变化。",
  },

  // Supply Chain 供应链 (10 templates)
  {
    id: "sc-1",
    department: "supplyChain",
    titleKey: "库存状态查询",
    prompt:
      "展示所有位置的当前库存水平。标记任何低于再订货点或有缺货风险的商品。",
  },
  {
    id: "sc-2",
    department: "supplyChain",
    titleKey: "供应商绩效评估",
    prompt: "生成供应商绩效评分卡，展示准时交货率、质量指标和成本趋势。",
  },
  {
    id: "sc-3",
    department: "supplyChain",
    titleKey: "需求预测",
    prompt: "根据历史销售数据和季节性趋势创建未来4周的需求预测。",
  },
  {
    id: "sc-4",
    department: "supplyChain",
    titleKey: "物流效率分析",
    prompt: "分析物流效率指标，包括配送时间、路线优化和运输成本。",
  },
  {
    id: "sc-5",
    department: "supplyChain",
    titleKey: "原材料成本追踪",
    prompt: "追踪主要原材料的成本变化趋势，并预测未来价格走势。",
  },
  {
    id: "sc-6",
    department: "supplyChain",
    titleKey: "配送时效分析",
    prompt: "分析各区域的配送时效，识别延迟原因并提供改进建议。",
  },
  {
    id: "sc-7",
    department: "supplyChain",
    titleKey: "仓储利用率",
    prompt: "分析各仓库的空间利用率和周转效率，提供优化建议。",
  },
  {
    id: "sc-8",
    department: "supplyChain",
    titleKey: "采购订单状态",
    prompt: "展示所有待处理采购订单的状态，包括预计到货时间和潜在延迟。",
  },
  {
    id: "sc-9",
    department: "supplyChain",
    titleKey: "供应链风险评估",
    prompt: "评估供应链风险，包括供应商集中度、地缘政治风险和替代方案。",
  },
  {
    id: "sc-10",
    department: "supplyChain",
    titleKey: "季节性备货建议",
    prompt: "根据历史数据和市场趋势，提供下一季度的备货建议。",
  },

  // DevOps 运维/DBA (10 templates)
  {
    id: "dev-1",
    department: "devops",
    titleKey: "系统健康检查",
    prompt:
      "运行全面的系统健康检查。展示CPU、内存、磁盘使用情况以及任何有问题的服务。",
  },
  {
    id: "dev-2",
    department: "devops",
    titleKey: "数据库性能分析",
    prompt: "分析数据库性能指标。识别慢查询、锁争用和索引优化机会。",
  },
  {
    id: "dev-3",
    department: "devops",
    titleKey: "错误日志分析",
    prompt:
      "分析过去24小时的错误日志。按错误类型分组并识别任何模式或重复问题。",
  },
  {
    id: "dev-4",
    department: "devops",
    titleKey: "部署状态查询",
    prompt: "展示所有环境的当前部署状态。列出最近的部署和任何待处理的变更。",
  },
  {
    id: "dev-5",
    department: "devops",
    titleKey: "安全审计检查",
    prompt: "运行安全审计检查。识别任何漏洞、过时的依赖项或合规问题。",
  },
  {
    id: "dev-6",
    department: "devops",
    titleKey: "资源扩容建议",
    prompt: "分析当前资源利用率，并根据流量模式推荐扩容调整。",
  },
  {
    id: "dev-7",
    department: "devops",
    titleKey: "API响应时间分析",
    prompt: "分析各API端点的响应时间，识别性能瓶颈并提供优化建议。",
  },
  {
    id: "dev-8",
    department: "devops",
    titleKey: "服务可用性报告",
    prompt: "生成服务可用性报告，包括SLA达成率、故障时间和恢复时间。",
  },
  {
    id: "dev-9",
    department: "devops",
    titleKey: "容量规划建议",
    prompt: "根据增长趋势和业务预测，提供未来6个月的容量规划建议。",
  },
  {
    id: "dev-10",
    department: "devops",
    titleKey: "告警趋势分析",
    prompt: "分析系统告警趋势，识别频繁告警的根本原因并提供解决方案。",
  },

  // Product 产品 (10 templates)
  {
    id: "prod-1",
    department: "product",
    titleKey: "功能使用分析",
    prompt: "展示移动应用的功能使用分析。按用户群体识别使用最多和最少的功能。",
  },
  {
    id: "prod-2",
    department: "product",
    titleKey: "用户旅程分析",
    prompt: "分析从打开应用到完成购买的用户旅程。识别流失点和转化瓶颈。",
  },
  {
    id: "prod-3",
    department: "product",
    titleKey: "A/B测试结果",
    prompt: "汇总所有进行中的A/B测试结果。展示统计显著性和建议的操作。",
  },
  {
    id: "prod-4",
    department: "product",
    titleKey: "客户反馈分析",
    prompt: "分析最近的客户反馈和应用商店评论。按情感分类并识别常见主题。",
  },
  {
    id: "prod-5",
    department: "product",
    titleKey: "产品KPI仪表盘",
    prompt: "生成产品KPI仪表盘，展示DAU、MAU、留存率和互动指标。",
  },
  {
    id: "prod-6",
    department: "product",
    titleKey: "用户留存分析",
    prompt: "分析用户留存数据，包括次日留存、7日留存和30日留存趋势。",
  },
  {
    id: "prod-7",
    department: "product",
    titleKey: "功能采用率追踪",
    prompt: "追踪新功能的采用率，分析用户接受度和使用频率。",
  },
  {
    id: "prod-8",
    department: "product",
    titleKey: "用户满意度趋势",
    prompt: "分析用户满意度趋势，包括NPS评分、CSAT和用户评价变化。",
  },
  {
    id: "prod-9",
    department: "product",
    titleKey: "版本发布影响分析",
    prompt: "分析最近版本发布对关键指标的影响，包括崩溃率、性能和用户反馈。",
  },
  {
    id: "prod-10",
    department: "product",
    titleKey: "竞品功能对比",
    prompt: "对比我们产品与主要竞品的功能差异，识别优势和改进机会。",
  },

  // Executive 高管 (10 templates)
  {
    id: "exec-1",
    department: "executive",
    titleKey: "执行摘要",
    prompt: "生成本月业务表现的执行摘要。包括关键指标、亮点和关注事项。",
  },
  {
    id: "exec-2",
    department: "executive",
    titleKey: "跨部门KPI对比",
    prompt: "展示跨部门KPI对比。标注超额完成或未达标的部门。",
  },
  {
    id: "exec-3",
    department: "executive",
    titleKey: "战略洞察",
    prompt: "根据当前市场趋势、竞争格局和我们的业绩数据提供战略洞察。",
  },
  {
    id: "exec-4",
    department: "executive",
    titleKey: "风险评估报告",
    prompt: "生成涵盖运营、财务和市场风险的风险评估报告，并提供缓解建议。",
  },
  {
    id: "exec-5",
    department: "executive",
    titleKey: "季度业绩回顾",
    prompt: "生成季度业绩回顾报告，包括营收、利润、增长率和目标达成情况。",
  },
  {
    id: "exec-6",
    department: "executive",
    titleKey: "市场份额分析",
    prompt: "分析我们在各区域和品类的市场份额变化趋势。",
  },
  {
    id: "exec-7",
    department: "executive",
    titleKey: "增长机会识别",
    prompt: "识别潜在的增长机会，包括新市场、新产品和战略合作。",
  },
  {
    id: "exec-8",
    department: "executive",
    titleKey: "运营效率总览",
    prompt: "提供运营效率总览，包括成本优化、流程改进和资源利用情况。",
  },
  {
    id: "exec-9",
    department: "executive",
    titleKey: "关键决策支持",
    prompt: "为当前面临的关键业务决策提供数据支持和分析建议。",
  },
  {
    id: "exec-10",
    department: "executive",
    titleKey: "年度目标进度",
    prompt: "展示年度目标的完成进度，识别落后领域并提供追赶计划。",
  },
];

export function getTemplatesByDepartment(
  department: DepartmentId,
): PromptTemplate[] {
  if (department === "general") {
    return promptTemplates;
  }
  return promptTemplates.filter((t) => t.department === department);
}
