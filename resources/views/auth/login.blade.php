@extends('layouts.app')

@section('content')
    <div class="edu-layout container-fluid p-0">
        <div class="row g-0 edu-wrapper">
            <div class="col-12 col-lg-5 edu-left d-flex align-items-start justify-content-start">
                <div class="edu-brand text-center text-lg-start">
                    <div class="edu-title">EduCore</div>
                    <div class="edu-subtitle">A Central System for Managing School and Faculty Operations</div>
                </div>
            </div>
            <div class="col-12 col-lg-7 edu-right d-flex align-items-center justify-content-center">
                <div class="edu-card">
                    <div class="edu-card-header text-center">
                        <div class="edu-avatar" aria-hidden="true">
                            <svg width="58" height="58" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z" fill="#1f1f1f"/>
                                <path d="M2 22a10 10 0 0 1 20 0" fill="#1f1f1f"/>
                            </svg>
                        </div>
                        <div class="edu-welcome">Welcome Back! Please login to your account</div>
                    </div>

                    <form method="POST" action="{{ route('login') }}" class="edu-form">
                        @csrf
                        <div class="mb-3">
                            <label for="email" class="form-label">userID</label>
                            <input id="email" type="text" placeholder="userID" class="form-control edu-input @error('email') is-invalid @enderror" name="email" value="{{ old('email', 'admin@university.test') }}" required autocomplete="username" autofocus>
                            @error('email')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-2">
                            <label for="password" class="form-label">Password</label>
                            <input id="password" type="password" placeholder="Password" class="form-control edu-input @error('password') is-invalid @enderror" name="password" value="password" required autocomplete="current-password">
                            @error('password')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <button type="submit" class="btn edu-btn w-100">Log in</button>
                        <div class="portal-footer"><a href="{{ route('admin.dashboard') }}" class="portal-link">Admin</a></div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('styles')
<style>
 
  .auth-shell { padding: 0 !important; background: #ffffff !important; }
  .edu-layout { min-height: 100vh; height: 100vh; }
  .edu-wrapper { width: 100%; min-height: 100vh; }
  .edu-left { background: #cea3a6; padding: 2rem; }
  .edu-right { background: #ffffff; padding: 2rem; }
  @media (min-width: 992px) { /* desktop */
    .edu-left { padding-top: 64px; padding-left: 48px; }
  }

  .edu-brand { max-width: 520px; }
  .edu-title { font-family: 'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-weight: 800; font-size: 64px; line-height: 1; color: #181818; }
  .edu-subtitle { margin-top: 8px; color: #1d1d1d; opacity: .85; max-width: 380px; }

  .edu-card { width: 100%; max-width: 520px; background: #e8c8ca; border-radius: 28px; padding: 2rem; box-shadow: 0 10px 28px rgba(0,0,0,.08); }
  .edu-card-header { margin-bottom: 1rem; }
  .edu-avatar { width: 64px; height: 64px; margin: 0 auto 10px; border-radius: 999px; display: grid; place-items: center; }
  .edu-welcome { color: #1d1d1d; font-weight: 600; font-size: .95rem; }

  .edu-form .form-label { color: #1f1f1f; font-weight: 600; font-size: .9rem; }
  .edu-input { height: 42px; border-radius: 8px; background: #f1dbdd; border: 0; box-shadow: inset 0 0 0 1px rgba(0,0,0,.06); }
  .edu-input:focus { background: #f6e6e7; box-shadow: 0 0 0 3px rgba(206,163,166,.35); }

  .edu-btn { background: #c59398; color: #1d1d1d; font-weight: 700; border-radius: 8px; height: 36px; box-shadow: none; }
  .edu-btn:hover { filter: brightness(1.02); }

  /* Hide Admin link on this page */
  .portal-footer { display: none !important; }

  @media (max-width: 991.98px) {
    .edu-left { min-height: 180px; }
    .edu-title { font-size: 44px; text-align: center; }
    .edu-subtitle { text-align: center; margin-left: auto; margin-right: auto; }
  }
</style>
@endpush