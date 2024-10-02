import { NextFunction, Request, Response } from 'express';
import { readData, writeData } from '../utils/data-file.utility';
import { UserRequest } from '../interfaces/user.interface';
import { Inventory } from '../interfaces/inventory.interface';
import { HttpStatusCode } from '../enums/status-code.enum';
import { errorConstants } from '../constants/index.constant';
import { UserRole } from '../enums/user.enum';
import logger from '../utils/logger.utility';

const errorMessages = errorConstants.messages;

/**
 * @description Function to handle creation of inventory
 * For now only a vendor can only create inventory
 */
const createInventory = (
  req: UserRequest,
  res: Response,
  next: NextFunction
): any => {
  try {
    const fileData = readData();

    const { user, body } = req || {};
    const newInvenotryData: Inventory = body;
    newInvenotryData.vendorId = user?.id || '';

    const isCodeAndSizeAlreadyExists = fileData?.inventory.some(
      (el) =>
        el.code === newInvenotryData.code && el.size === newInvenotryData.size
    );

    logger.info(`Product Existance : ${isCodeAndSizeAlreadyExists}`);

    if (isCodeAndSizeAlreadyExists) {
      return res
        .status(HttpStatusCode.Conflict)
        .json({ message: errorMessages.productAlreadyExists });
    }

    fileData?.inventory.push(newInvenotryData);
    writeData(fileData);
    return res
      .status(HttpStatusCode.Created)
      .json({ message: 'Apparel created', data: newInvenotryData });
  } catch (err: any) {
    logger.error({
      apiMethod: 'controller/inventory/create',
      message: 'Error inside create handler',
      data: err.stack,
    });
    next(err);
  }
};

/**
 * @description Function to handle update of inventory
 * For now only a vendor can only update inventory
 * Currently only price and quantity update is implemented, but can be enhanced if required
 */
const updateInventory = (
  req: UserRequest,
  res: Response,
  next: NextFunction
): any => {
  try {
    const fileData = readData();
    const { user, body } = req;
    const code = req.params.code;
    const size = req.params.size;

    const indexOfProduct = fileData?.inventory.findIndex(
      (el) => el.code === code && el.size === size && el.vendorId === user?.id
    );

    logger.info(`Index for the product ${indexOfProduct}`);

    if (indexOfProduct < 0) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ message: errorMessages.noRecordToUpdate });
    }

    if (body.price) fileData.inventory[indexOfProduct].price = body.price;
    if (body.quantity)
      fileData.inventory[indexOfProduct].quantity = body.quantity;

    writeData(fileData);

    return res.status(HttpStatusCode.OK).json({ message: 'Data updated' });
  } catch (err: any) {
    logger.error({
      apiMethod: 'controller/inventory/update',
      message: 'Error inside update handler',
      data: err.stack,
    });
    next(err);
  }
};

/**
 * @description Function to handle update of inventories in bulk
 * For now only a vendor can only update inventories created by them
 * Currently only price and quantity update is implemented, but can be enhanced if required
 */
const updateInventoryInBulk = (
  req: UserRequest,
  res: Response,
  next: NextFunction
): any => {
  try {
    const fileData = readData();
    const { user, body } = req;

    const response: { message: string }[] = [];

    body.items.forEach((product: Inventory) => {
      const indexOfProduct = fileData?.inventory.findIndex(
        (el) =>
          el.code === product.code &&
          el.size === product.size &&
          el.vendorId === user?.id
      );

      logger.debug(`Index for current iteration : ${indexOfProduct}`);

      if (indexOfProduct < 0) {
        response.push({ message: errorMessages.noRecordToUpdate });
      } else {
        if (product.price)
          fileData.inventory[indexOfProduct].price = product.price;
        if (product.quantity)
          fileData.inventory[indexOfProduct].quantity = product.quantity;

        writeData(fileData);
        response.push({ message: 'Message proccessed' });
      }
    });

    return res
      .status(HttpStatusCode.OK)
      .json({ message: 'Data processed', data: response });
  } catch (err: any) {
    logger.error({
      apiMethod: 'controller/inventory/updateBulk',
      message: 'Error inside update bulk handler',
      data: err.stack,
    });
    next(err);
  }
};

/**
 * @description Function to handle fetching of all inventories
 * For now only vendor and admin can see all inventories
 * Admin can see all inventories created by every vendor
 */
const getAllInventory = (
  req: UserRequest,
  res: Response,
  next: NextFunction
): any => {
  try {
    const { user } = req;
    const fileData = readData();
    if (fileData.inventory.length === 0) {
      return res
        .status(HttpStatusCode.OK)
        .json({ message: errorMessages.noDataFound });
    }

    if (user?.role === UserRole.ADMIN) {
      return res
        .status(HttpStatusCode.OK)
        .json({ message: 'Data found!', data: fileData.inventory });
    }

    const allInventoryForCurrentVendor = fileData.inventory.filter(
      (el) => el.vendorId === user?.id
    );
    if (allInventoryForCurrentVendor.length === 0) {
      return res
        .status(HttpStatusCode.OK)
        .json({ message: errorMessages.noDataFound });
    }

    return res
      .status(HttpStatusCode.OK)
      .json({ message: 'Data found', data: allInventoryForCurrentVendor });
  } catch (err: any) {
    logger.error({
      apiMethod: 'controller/inventory/getAll',
      message: 'Error inside get all inventory handler',
      data: err.stack,
    });
    next(err);
  }
};

/**
 * @description Function to handle fetching of all inventories by product code
 * For now only vendor and admin can see all inventories by code
 * Admin can see inventories created by all vendors
 */
const getAProductOnInventoryByProductCode = (
  req: UserRequest,
  res: Response,
  next: NextFunction
): any => {
  try {
    const code = req.params.code;
    const { user } = req;
    const fileData = readData();
    if (fileData.inventory.length === 0) {
      return res
        .status(HttpStatusCode.OK)
        .json({ message: errorMessages.noDataFound });
    }

    const dataFilteredByCode = fileData.inventory.filter(
      (el) => el.code === code
    );

    if (dataFilteredByCode.length === 0)
      return res
        .status(HttpStatusCode.OK)
        .json({ message: errorMessages.noDataFound });

    if (user?.role === UserRole.ADMIN) {
      return res.status(HttpStatusCode.OK).json({
        message: 'Products Found',
        data: dataFilteredByCode,
      });
    }

    const allInventoryByCodeForCurrentVendor = dataFilteredByCode.filter(
      (el) => el.vendorId === user?.id && el.code === code
    );
    if (allInventoryByCodeForCurrentVendor.length === 0) {
      return res
        .status(HttpStatusCode.OK)
        .json({ message: errorMessages.noDataFound });
    }

    return res.status(HttpStatusCode.OK).json({
      message: 'Products Found',
      data: allInventoryByCodeForCurrentVendor,
    });
  } catch (err: any) {
    logger.error({
      apiMethod: 'controller/inventory/getAllByCode',
      message: 'Error inside create handler',
      data: err.stack,
    });
    next(err);
  }
};

/**
 * @description Function to handle calculation for fulfilment of order get by any customer to a user
 */
const checkForInventory = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  try {
    const orderItems: Inventory[] = req.body.items || [];
    const inventory = readData().inventory;

    const isOrderFulfillable = orderItems.every((item) => {
      const { code, size, quantity } = item;
      const stock = inventory.find(
        (inv) => inv.code === code && inv.size === size
      );

      return stock && stock.quantity >= quantity;
    });

    if (isOrderFulfillable) {
      return res
        .status(HttpStatusCode.OK)
        .json({ message: 'Order Can be fulfilled' });
    }
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ message: errorMessages.orderCannotFulfilled });
  } catch (err: any) {
    logger.error({
      apiMethod: 'controller/inventory/checkForInventory',
      message: 'Error inside get all inventory by code handler',
      data: err.stack,
    });
    next(err);
  }
};

/**
 * @description Function to handle calculation of min price for fulfilment of order get by any customer to a user
 */
const findMinimumPriceToFulfilOrder = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  try {
    let totalCost = 0;
    const orderItems: Inventory[] = req.body.items || [];
    const inventory = readData().inventory;

    for (let item of orderItems) {
      let { code, size, quantity } = item;
      const stock = inventory.find(
        (inv) => inv.code === code && inv.size === size
      );
      if (!stock) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({
            message: `Products with code ${code} and size ${size} not available`,
          });
      }
      if (stock && stock.quantity < quantity) {
        return res
          .status(HttpStatusCode.BadRequest)
          .json({ message: `Insufficient stock for ${code} size ${size}` });
      }
      const currentStock = stock ? stock.price : 0;
      totalCost += quantity * currentStock;
    }
    res
      .status(HttpStatusCode.OK)
      .json({ data: { totalCost }, message: 'Minimum Price Calculated' });
  } catch (err: any) {
    logger.error({
      apiMethod: 'controller/inventory/minPriceFetch',
      message: 'Error inside min price calc handler',
      data: err.stack,
    });
    next(err);
  }
};

export {
  createInventory,
  updateInventory,
  getAllInventory,
  getAProductOnInventoryByProductCode,
  checkForInventory,
  findMinimumPriceToFulfilOrder,
  updateInventoryInBulk,
};
