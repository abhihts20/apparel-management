import Joi from 'joi';
import { InventoryApparelSize } from '../enums/inventory.enum';

export const apparelRegisterSchema = Joi.object({
  title: Joi.string().required().min(1).max(50),
  description: Joi.string().required().min(10).max(200),
  code: Joi.string().required(),
  size: Joi.string()
    .required()
    .valid(...Object.values(InventoryApparelSize)),
  quantity: Joi.number().required(),
  price: Joi.number().required(),
});

export const apparelUpdateSchema = Joi.object({
  quantity: Joi.number().required(),
  price: Joi.number().required(),
});

export const apparelBulkUpdateSchema = Joi.object({
  items: Joi.array().items({
    code: Joi.string().required(),
    size: Joi.string()
      .required()
      .valid(...Object.values(InventoryApparelSize)),
    quantity: Joi.number().required(),
    price: Joi.number().required(),
  }),
});

export const checkForOrderFulfilmentSchema = Joi.object({
  items: Joi.array()
    .items({
      code: Joi.string().required(),
      size: Joi.string()
        .required()
        .valid(...Object.values(InventoryApparelSize)),
      quantity: Joi.number().required(),
    })
    .required(),
});
