import request from "supertest";
import { app } from "../../app";
import { Order } from "../../model/order";
import { Ticket } from "../../model/ticket";
import { signin } from "../../services/signinFunction";
import mongoose from "mongoose";

const buildTicket = async ()=>{
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title:'Concert',
        price:20
    })
    await ticket.save();

    return ticket;
}

it('fetches order for an particular users',async ()=>{
    // create three tickets
    const ticketOne = await buildTicket()
    const ticketTwo =  await buildTicket()
    const ticketThree = await buildTicket()

    const userOne = signin();
    const userTwo = signin();

    // create one order as user 1
    await request(app)
        .post('/api/orders')
        .set('Cookie',userOne)
        .send({ticketId:ticketOne.id})
        .expect(201)

    // create two orders as user 2
    const {body:orderOne} = await request(app)
        .post('/api/orders')
        .set('Cookie',userTwo)
        .send({ticketId:ticketTwo.id})
        .expect(201);

    const {body:orderTwo} = await request(app)
        .post('/api/orders')
        .set('Cookie',userTwo)
        .send({ticketId:ticketThree.id})
        .expect(201)

    // make request to get order for user 2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie',userTwo)
        .expect(200);
    
    // make sure we only got the orders for user 2

    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id)
    expect(response.body[1].ticket.id).toEqual(ticketThree.id)
})