import {Controller, Inject} from "@tsed/di";
import {ContentType, Get} from "@tsed/schema";
import {PrometheusService} from "../../services/PrometheusService";

@Controller("/metrics")
export class MetricsController {
  @Inject()
  protected metricsService : PrometheusService;

  @Get("/")
  @ContentType("text/plain; version=0.0.4; charset=utf-8")
  getMetrics() {
    return this.metricsService.getMetrics();
  }
}
