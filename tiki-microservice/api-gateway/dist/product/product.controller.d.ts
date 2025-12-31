import { ClientProxy } from '@nestjs/microservices';
export declare class ProductController {
    private readonly productClient;
    private readonly logger;
    constructor(productClient: ClientProxy);
    onModuleInit(): Promise<void>;
    findAll(query: any): Promise<any>;
    findOne(id: number): Promise<any>;
}
