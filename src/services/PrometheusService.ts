import {Injectable, Service} from "@tsed/di";
import {collectDefaultMetrics, Registry,} from "prom-client";

@Injectable()
@Service()
export class PrometheusService {
    public register = new Registry();
    constructor() {
        this.register.setDefaultLabels({ app: 'node' })
        collectDefaultMetrics({ register: this.register });
    }

    getMetrics() {
        return this.register.metrics();
    }
}
