import { OrderCancelledEvent, OrderStatus } from "@mstiketing/common";
import { Message } from 'node-nats-streaming';
import { natsWrapper } from "../../../nats-wrapper"
import { Order } from "../../../models/order";
import { OrderCancelledListener } from "../order-cancelled-listener"
import mongoose from "mongoose";
const setup = async()=>{
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status:OrderStatus.Created,
        price:10,
        userId:'ksdfjh',
        version:0
    });
    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id:order.id,
        version:1,
        ticket:{
            id:'kjhsdf'
        }
    }
    // @ts-ignore  
    const msg:Message ={
        ack:  jest.fn()
    }
    return { listener, data, msg, order}
}



it('updates th e status of the order',async ()=>{
    const { listener,data,msg,order} = await setup();

    await listener.onMessage(data,msg);
    const updateOrder = await Order.findById(order.id);
    expect(updateOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('ack the message',async ()=>{
    const { listener,data,msg,order} = await setup();

    await listener.onMessage(data,msg);

    expect(msg.ack).toHaveBeenCalled();
})