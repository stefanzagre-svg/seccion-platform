import { DashboardCompiler } from '../e2e/utils/compile-ux-report';

const compiler = new DashboardCompiler('./reports/ux-audit-reports', './reports/ux-report-dashboard.html');
const result = compiler.compile();
console.log(result);
