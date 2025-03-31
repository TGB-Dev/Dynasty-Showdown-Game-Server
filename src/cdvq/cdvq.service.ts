import { Injectable } from "@nestjs/common";
import { CdvqGateway} from "./cdvq.gateway";

@Injectable()
export class CdvqService {
  constructor(private readonly cdvqGateway: CdvqGateway) {}
}