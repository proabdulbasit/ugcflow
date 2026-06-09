import mongoose from 'mongoose';
import { Brand } from '../models/index.js';

export async function incrementBrandCredits(brandId: string, amount: number) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const brand = await Brand.findById(brandId).session(session);
    if (!brand) throw new Error('Brand not found');
    brand.credits = Number(brand.credits ?? 0) + amount;
    await brand.save({ session });
    await session.commitTransaction();
    return brand.credits;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export async function spendBrandCredits(brandId: string, amount: number): Promise<boolean> {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const brand = await Brand.findById(brandId).session(session);
    if (!brand || brand.credits < amount) {
      await session.abortTransaction();
      return false;
    }
    brand.credits -= amount;
    await brand.save({ session });
    await session.commitTransaction();
    return true;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export function creditsForPackageName(name: string, videoCount: number): number {
  const lower = name.toLowerCase();
  if (lower.includes('starter')) return 267;
  if (lower.includes('growth')) return 534;
  if (lower.includes('scale')) return 890;
  return videoCount || 0;
}
