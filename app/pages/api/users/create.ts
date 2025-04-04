import pool from "@/app/lib/db";
import { NextApiRequest, NextApiResponse } from 'next';

interface User {
  id: number;
  name: string;
  email: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | ErrorResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      error: `Method ${req.method} Not Allowed` 
    });
  }

  // Validate request body
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ 
      error: 'Name and email are required' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Invalid email format' 
    });
  }

  // Database operation
  try {
    const result = await pool.query<User>(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name.trim(), email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(500).json({ 
        error: 'User creation failed - no data returned' 
      });
    }

    return res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Database error:', error);
    
    // Handle unique constraint violation (duplicate email)
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return res.status(409).json({ 
        error: 'Email already exists',
        details: 'Please use a different email address'
      });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}