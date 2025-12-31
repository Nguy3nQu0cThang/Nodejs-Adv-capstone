import { ClientProxy } from '@nestjs/microservices';
export declare class OrderController {
    private readonly orderClient;
    private readonly logger;
    constructor(orderClient: ClientProxy);
    onModuleInit(): Promise<void>;
    createOrder(auth: string, dto: any): Promise<any>;
    getOrders(auth: string, query: any): Promise<any>;
}
