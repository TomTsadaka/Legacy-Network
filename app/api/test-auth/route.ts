import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    console.log('🧪 Test auth endpoint called');
    console.log('   Username:', username);
    
    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found',
        debug: { username }
      });
    }
    
    if (!user.password) {
      return NextResponse.json({ 
        success: false, 
        error: 'User has no password',
        debug: { userId: user.id }
      });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    
    return NextResponse.json({
      success: isValid,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      passwordValid: isValid,
      debug: {
        hashedPassword: user.password.substring(0, 20) + '...',
        inputPassword: password,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
