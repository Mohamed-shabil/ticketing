import { OrderStatus } from '@mstiketing/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { TicketDoc } from './ticket';

export { OrderStatus};

interface OrderAttrs{
    userId:string;
    status:OrderStatus; 
    expiresAt:Date;
    ticket: TicketDoc;
}

interface OrderDoc extends mongoose.Document{
    version: number;
    userId:string;
    status:OrderStatus ;
    expiresAt:Date;
    ticket: TicketDoc; 
}

interface OrderModel extends mongoose.Model<OrderDoc>{
    build(attrs:OrderAttrs):OrderDoc;
}

const orderSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true,
        enum:Object.values(OrderStatus),
        default: OrderStatus.Created
    },
    expiresAt:{
        type:mongoose.Schema.Types.Date
    },
    ticket:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Ticket'
    }
},{
    toJSON:{
        transform(doc,ret){
            // transforming _id to id
            ret.id = ret._id;
            delete ret._id
            // removing the password from the returning doc not from the db
            delete ret.password;
            delete ret.__v;
        }
    }
})

orderSchema.set('versionKey','version');
orderSchema.plugin(updateIfCurrentPlugin)
orderSchema.statics.build = (attrs:OrderAttrs)=>{
    return new Order(attrs);  
}

const Order = mongoose.model<OrderDoc,OrderModel>('Order',orderSchema);

export{ Order };