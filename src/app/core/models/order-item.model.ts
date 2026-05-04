export interface OrderItem {
    id: number;
    name: string;
    qty: number;
    price: number;
    status: 'ok' | 'pending' | 'error';
}