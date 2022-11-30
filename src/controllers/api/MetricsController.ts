import {Controller, Inject} from "@tsed/di";
import {Get} from "@tsed/schema";
import {PrometheusService} from "../../services/PrometheusService";

@Controller("/metrics")
export class MetricsController {
  @Inject()
  protected metricsService : PrometheusService;

  @Get("/")
  getMetrics() {
    return this.metricsService.getMetrics();
  }
}
