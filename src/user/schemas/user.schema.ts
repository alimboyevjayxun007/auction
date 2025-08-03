// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  otp: string | null;
  otpExpiry: Date | null;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    name: string

    @Prop({ required: true, unique: true })
    email: string

    @Prop({ required: true })
    password: string

    @Prop({ enum: UserRole, default: UserRole.USER })
    role: UserRole

    @Prop({ default: false })
    isVerified: boolean

    @Prop({ type: String, default: null })
    otp: string | null

    @Prop({ type: Date, default: null })
    otpExpiry: Date | null
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.methods.comparePassword = async function (
  this: UserDocument,
  enteredPassword: string,
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};
