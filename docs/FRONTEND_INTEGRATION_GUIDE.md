# Frontend Integration Guide (React & Angular)

This guide provides clean, production-ready TypeScript code examples for frontend engineers integrating with this API.

---

## 1. API Summary & Conventions

- **Base URL**: `http://localhost:5000/api` (or production cloud URL)
- **Content-Type**: `application/json`
- **Standard API Envelope**:
  ```json
  {
    "success": true,
    "message": "Operation description",
    "data": { ... },
    "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
  }
  ```
- **Authentication**: Bearer Token in `Authorization: Bearer <token>`.
- **Guest Carts**: Pass `x-session-token: <uuid>` header or query param. When the user logs in, call `POST /api/cart/sync` with `{ sessionToken: "<uuid>" }`.

---

## 2. React Integration (Axios / Fetch + React Hooks)

### A. API Client Configuration (`src/api/client.ts`)
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT and Guest Session Token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  let sessionToken = localStorage.getItem('guest_session_token');
  if (!sessionToken && !token) {
    sessionToken = crypto.randomUUID();
    localStorage.setItem('guest_session_token', sessionToken);
  }
  if (sessionToken) {
    config.headers['x-session-token'] = sessionToken;
  }

  return config;
});
```

### B. Auth Context & Hook (`src/context/AuthContext.tsx`)
```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      apiClient.get('/auth/profile')
        .then((res) => setUser(res.data.data))
        .catch(() => logout())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    setUser(userData);

    // Sync guest cart if one existed
    const guestSessionToken = localStorage.getItem('guest_session_token');
    if (guestSessionToken) {
      await apiClient.post('/cart/sync', { sessionToken: guestSessionToken });
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
```

### C. Product List Component (`src/components/ProductList.tsx`)
```tsx
import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/products?page=1&limit=12')
      .then((res) => setProducts(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (productId: string) => {
    await apiClient.post('/cart/items', { productId, quantity: 1 });
    alert('Product added to cart!');
  };

  if (loading) return <div>Loading catalog...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {products.map((p) => (
        <div key={p.id} style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
          <img src={p.images?.[0]?.image_url || 'https://via.placeholder.com/300'} alt={p.title} width="100%" />
          <h3>{p.title}</h3>
          <p>${p.price.toFixed(2)}</p>
          <button onClick={() => handleAddToCart(p.id)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
};
```

---

## 3. Angular Integration (HttpClient + RxJS)

### A. Auth Interceptor (`src/app/interceptors/auth.interceptor.ts`)
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let headers = req.headers;
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    let guestToken = localStorage.getItem('guest_session_token');
    if (!guestToken && !token) {
      guestToken = crypto.randomUUID();
      localStorage.setItem('guest_session_token', guestToken);
    }
    if (guestToken) {
      headers = headers.set('x-session-token', guestToken);
    }

    const authReq = req.clone({ headers });
    return next.handle(authReq);
  }
}
```

### B. Product Service (`src/app/services/product.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient) {}

  getProducts(page = 1, limit = 20, category?: string): Observable<any[]> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (category) params = params.set('category', category);

    return this.http.get<ApiResponse<any[]>>(this.baseUrl, { params }).pipe(
      map(res => res.data)
    );
  }

  getProductById(identifier: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${identifier}`).pipe(
      map(res => res.data)
    );
  }
}
```

### C. Cart Service (`src/app/services/cart.service.ts`)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly baseUrl = 'http://localhost:5000/api/cart';
  private cartSubject = new BehaviorSubject<any>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    this.refreshCart();
  }

  refreshCart(): void {
    this.http.get<any>(this.baseUrl).subscribe(res => {
      this.cartSubject.next(res.data);
    });
  }

  addToCart(productId: string, quantity = 1): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/items`, { productId, quantity }).pipe(
      tap(res => this.cartSubject.next(res.data))
    );
  }

  updateQuantity(itemId: string, quantity: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/items/${itemId}`, { quantity }).pipe(
      tap(res => this.cartSubject.next(res.data))
    );
  }

  removeItem(itemId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/items/${itemId}`).pipe(
      tap(res => this.cartSubject.next(res.data))
    );
  }
}
```
