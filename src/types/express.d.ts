// src/types/express.d.ts

import { User } from './path/to/user/type';  // Replace this with the correct import for your User type.

declare global {
  namespace Express {
    interface Request {
      user?: User; // Add user property with the appropriate type.
      logout: (cb: (err: any) => void) => void; // Define logout method, used by Passport.js
    }
  }
}
