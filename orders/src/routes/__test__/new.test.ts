import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../services/signinFunction';
import { Order } from '../../model/order';
import { Ticket } from '../../model/ticket';
import { OrderStatus } from '../../model/order';
import { natsWrapper } from '../../nats-wrapper';


it('returns an error if the ticket does not exist', async()=>{
    const ticketId = new mongoose.Types.ObjectId();
    await request(app)
        .post('/api/orders')
        .set('Cookie',signin())
        .send({
            ticketId,
        })
        .expect(404)
});

it('returns an error if the ticket is already reserved', async()=>{
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'Concert',
        price:20
    });
    await ticket.save();

    const order = Order.build({
        ticket,
        userId:'jkhsdfjkasdf',
        status:OrderStatus.Created,
        expiresAt:new Date() 
    })  
    await order.save();
    
    const resp = await request(app)
        .post('/api/orders')
        .set('Cookie',signin())
        .send({ticketId:ticket.id})
        .expect(400);

});

it('reserves a ticket', async()=>{
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'Concert',
        price:20
    });
    const resp = await ticket.save();
    await request(app)
        .post('/api/orders')
        .set('Cookie',signin())
        .send({ticketId:ticket.id})
        .expect(201);
});

it('todo emit an order created event',async()=>{
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'concert',
        price:20,
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie',signin())
        .send({ticketId:ticket.id})
        .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});