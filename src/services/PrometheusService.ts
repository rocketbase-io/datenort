import {Injectable, Service} from "@tsed/di";
import * as Prometheus from "prom-client";

@Injectable()
@Service()
export class PrometheusService {
    private register = new Prometheus.Registry();
    constructor() {
        this.register.setDefaultLabels({ app: 'example-nodejs-app' })
        Prometheus.collectDefaultMetrics({ register: this.register });
    }

    getMetrics() {
        return this.register.metrics();
    }
}
