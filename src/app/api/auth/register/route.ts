import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, password, firstName, lastName } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'User already exists.' }, { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, firstName, lastName });
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return NextResponse.json({ token, user: { email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Registration failed.' }, { status: 500 });
  }
} 