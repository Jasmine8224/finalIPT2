<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel') }} - Admin</title>

    <!-- Fonts -->
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Styles -->
    <!-- Bootstrap first (base), then compiled CSS to override -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link href="{{ asset('css/app.css') }}?v={{ file_exists(public_path('css/app.css')) ? filemtime(public_path('css/app.css')) : time() }}" rel="stylesheet">
    <link href="{{ asset('css/admin.css') }}?v={{ file_exists(public_path('css/admin.css')) ? filemtime(public_path('css/admin.css')) : time() }}" rel="stylesheet">
    <style>
      /* Page background like mockup */
      body{background:#f3f4f6}
      /* Fullscreen layout adjustments */
      main.py-4{padding-top:0!important;padding-bottom:0!important}
      .container-fluid{max-width:100%;padding-left:0;padding-right:0}
      /* EduCore heading */
      .edu-heading-inline{font-family:'Poppins',system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-weight:800;font-size:64px;line-height:1.05;color:#5a46c9;margin:0}
      /* Coral panel behind dashboard content */
      #admin-app.dash-container{background:#e4b2b6;border-radius:22px;padding:0 28px 28px 28px;box-shadow:0 10px 26px rgba(0,0,0,.10);margin:0}
      /* Create consistent vertical rhythm between top-level sections rendered by React */
      #admin-app.dash-container > * + *{margin-top:18px}
      /* Dashboard section tweaks to match Figma */
      .coral-panel{background:rgba(0,0,0,0);padding:6px 2px}
      .coral-panel .inner-card{background:#f4cbd2;border:1px solid rgba(203, 120, 126, .35);border-radius:16px;padding:14px 16px;box-shadow:0 6px 16px rgba(0,0,0,.08)}
      .coral-panel .inner-title{color:#2749c9;font-weight:800;font-size:1.1rem}
      .coral-panel .inner-trend{color:#37b24d;font-weight:700}
      .activity-list,.notif-list{margin:0;padding-left:0;list-style:none}
      .activity-list li,.notif-list li{margin:.35rem 0;display:flex;gap:.5rem;align-items:flex-start}
      .activity-list .a-icon,.notif-list .n-icon{width:1.1rem;text-align:center;opacity:.9}
      .page-actions{display:flex;gap:.6rem;justify-content:flex-end;align-items:center}
      /* Top action buttons */
      .btn.btn-archive-green{background:#e74c3c!important;color:#fff!important;border-color:#e74c3c!important;border-width:0;border-radius:9999px;padding:.5rem 1.1rem;font-weight:700;box-shadow:inset 0 -2px 0 rgba(0,0,0,.15)}
      .btn.btn-add-black{background:#e5e7eb!important;color:#111!important;border-color:#e5e7eb!important;border-width:0;border-radius:9999px;padding:.5rem 1.1rem;font-weight:700;box-shadow:inset 0 -2px 0 rgba(0,0,0,.05)}
      /* Row action buttons */
      .btn.btn-edit{background:#3b82f6!important;color:#fff!important;border:0!important;border-radius:10px;padding:.35rem .8rem;font-weight:600}
      .btn.btn-archive{background:transparent!important;color:#e74c3c!important;border:1px solid #e74c3c!important;border-radius:10px;padding:.35rem .8rem;font-weight:600}
      .btn.btn-archive:hover{background:#e74c3c!important;color:#fff!important}
      /* Reports actions */
      .report-actions .btn-print{background:#3b82f6;color:#fff;border:0;border-radius:9999px;padding:.45rem 1rem;font-weight:700}
      .report-actions .btn-pdf{background:#e74c3c;color:#fff;border:0;border-radius:9999px;padding:.45rem 1rem;font-weight:700}
      /* Settings (Courses/Departments/Academic) enhancements */
      .settings-container{margin-top:.5rem}
      .settings-tabs .nav{gap:.5rem}
      .settings-tabs .nav .nav-link{border-radius:9999px;background:#d8d8d8;color:#2b2b2b;font-weight:700;padding:.35rem 1.1rem;border:0}
      .settings-tabs .nav .nav-link.active{background:#bfc7ff;color:#27315d;box-shadow:inset 0 -2px 0 rgba(0,0,0,.12)}
      .settings-panel{background:linear-gradient(180deg,#efb5bb 0%, #d97a82 100%);border-radius:22px;padding:18px;box-shadow:0 14px 28px rgba(0,0,0,.12);margin-top:.75rem}
      .settings-panel .panel-header h5{font-weight:800;margin:0}
      .settings-panel .panel-header p{margin:.15rem 0 1rem 0;color:#3c2626}
      .settings-panel .form-card{background:linear-gradient(180deg,#e7a8ae 0%, #d67178 100%);border:0;border-radius:18px;padding:16px;box-shadow:0 12px 22px rgba(0,0,0,.15)}
      .settings-panel .table-card{background:linear-gradient(180deg,#e7a8ae 0%, #d67178 100%);border:0;border-radius:18px;padding:12px;box-shadow:0 12px 22px rgba(0,0,0,.15)}
      .settings-panel .table-card .table{background:#ffffff;border-radius:14px;overflow:hidden}
      .settings-panel .table-card h6{font-weight:800;margin:0 0 .5rem 0}
      .settings-panel .form-card .form-label{font-weight:700;margin-bottom:.25rem}
      .settings-panel .form-card .form-control,
      .settings-panel .form-card .form-select{border-radius:16px;background:#ffffff;border:1px solid rgba(0,0,0,.08);padding:.8rem 1rem}
      .settings-panel .btn-brand{background:#4f46e5;color:#fff;border:0;border-radius:16px;padding:.8rem 1.1rem;font-weight:800;box-shadow:inset 0 -2px 0 rgba(0,0,0,.15);width:100%;min-height:48px}
      .settings-panel .btn-secondary{background:#e5e7eb;color:#111;border:0;border-radius:9999px;padding:.45rem 1rem;font-weight:700}
      .settings-panel .btn-outline-primary{border-color:#3b82f6;color:#3b82f6;border-radius:12px;background:#ffffff}
      .settings-panel .btn-outline-primary:hover{background:#3b82f6;color:#fff}
      .settings-panel .btn-outline-danger{border-color:#e74c3c;color:#e74c3c;border-radius:12px;background:#ffffff}
      .settings-panel .btn-outline-danger:hover{background:#e74c3c;color:#fff}
      .settings-panel .status-badge{border-radius:9999px;padding:.2rem .6rem;font-weight:700}
      .settings-panel .status-badge.status-active{background:#d3f9d8;color:#2b8a3e}
      .settings-panel .status-badge.status-inactive{background:#ffe3e3;color:#c92a2a}
      /* Fallback styles for add/edit forms */
      .btn.btn-back{background:#6f6a6a;color:#fff;border:0;border-radius:9999px;padding:.3rem .8rem;font-weight:600;font-size:.85rem}
      .form-actions{display:flex;gap:.75rem;justify-content:flex-end}
      .btn.btn-save{background:#6a73d8;color:#fff;border:0;border-radius:9999px;padding:.45rem 1.1rem;font-weight:600;font-size:.9rem}
      .btn.btn-cancel{background:#f1f1f1;color:#c0392b;border:1px solid rgba(224,127,122,.6);border-radius:9999px;padding:.45rem .95rem;font-weight:600;font-size:.9rem}
      /* Coral frame and inner card */
      .coral-form{position:relative;background:#e07a79;border-radius:22px;padding:1rem .8rem .8rem .8rem;box-shadow:0 8px 18px rgba(0,0,0,.18)}
      .coral-form .form-card{background:#ffffff;border-radius:12px;padding:.75rem;border:1px solid rgba(0,0,0,.05);margin-top:.15rem}
      /* Tables inside pink frames */
      .students-table .student-card,
      .faculties-table .faculty-card{background:#f6f7f9;border:1px solid rgba(133, 100, 100, 0.06);border-radius:16px;overflow:hidden;box-shadow:0 6px 16px rgba(0,0,0,.08)}
      .students-table .student-card .table,
      .faculties-table .faculty-card .table{margin-bottom:0}
      .students-table .student-card .table thead th,
      .faculties-table .faculty-card .table thead th{background:#f8fafc}
      /* Tighter spacing */
      .form-container .form-card .form-header{margin-bottom:.5rem;padding-bottom:.25rem}
      .form-container .form-group{margin-bottom:.45rem}
      .form-grid{gap:.5rem}
      .form-container .form-group .form-control,
      .form-container .form-group .form-select{padding:.35rem .65rem}
      .form-container label{margin-bottom:.25rem;font-weight:600}
      .form-actions{margin-top:.5rem;padding-top:.4rem}
      /* Back pill inside coral frame */
      .back-over{position:absolute;top:8px;right:16px;z-index:2}
      /* Page title styles */
      .page-title-text{font-size:2.25rem;line-height:1.1;font-weight:700;color:#2b1717;margin:0}
      .page-subtitle-text{color:#9b9b9b;font-size:1.05rem;margin-top:.2rem}
      .page-title-icon{color:#000;margin-right:.35rem}
      .form-container .form-group .form-control,
      .form-container .form-group .form-select,
      .form-container textarea.form-control{background:#efefef;border:1px solid #e0e0e0;border-radius:12px}
      .form-container .form-group .form-control:focus,
      .form-container .form-group .form-select:focus,
      .form-container textarea.form-control:focus{background:#f6f6f6;border-color:#d0d0d0;box-shadow:none}
      /* Faculty index: remove coral ribbon and pink filter tint */
      .faculties-table .faculty-card{padding-top:0}
      .faculties-table .faculty-card::before{display:none}
      .faculty-filters .filter-input,
      .faculty-filters .filter-select{background:#fff;border:1px solid #e5e7eb}

      /* Print styles for clean PDF output */
      @media print{
        body{background:#ffffff!important}
        main.py-4{padding:0!important}
        .edu-heading-inline,.side-card,.side-heading,.page-actions,.report-actions,.report-settings,.btn{display:none!important}
        #admin-app.dash-container{background:#ffffff!important;box-shadow:none!important;border-radius:0!important;padding:0!important;margin:0!important}
        .report-table .report-card{box-shadow:none!important;border:0!important}
        .report-table{margin:0!important}
        table{page-break-inside:auto}
        tr{page-break-inside:avoid;page-break-after:auto}
        thead{display:table-header-group}
        tfoot{display:table-footer-group}
      }
      /* Profile page styles */
      .profile-card{background:#ffffff;border-radius:18px;padding:18px;box-shadow:0 12px 24px rgba(0,0,0,.10)}
      .profile-banner{background:#e9e6e6;border-radius:16px;padding:12px 16px;box-shadow:0 4px 10px rgba(0,0,0,.08);color:#3b3b3b;margin-bottom:14px}
      .profile-avatar-lg{overflow:hidden;border-radius:50%;width:96px;height:96px;background:#e7ebff;display:flex;align-items:center;justify-content:center;font-size:42px}
      .profile-input.form-control{border-radius:16px;background:#ffffff;border:1px solid #e6e6e6}
      .btn-profile-primary{background:#4f46e5;color:#fff;border:0;border-radius:14px;padding:.55rem 1rem;font-weight:700}
    </style>
 </head>
<body>
    <div id="app">
        

        <main class="py-4">
            <div class="container-fluid">
                <!-- React Admin App will mount here -->
                <div id="admin-app" class="dash-container"></div>
            </div>
        </main>
    </div>

    <!-- Pass data to JavaScript -->
    <script>
        window.adminUser = @json(auth()->user());
        window.adminProfile = @json($adminProfile ?? null);
        window.adminStats = @json($stats ?? []);
        window.archivedProfiles = @json($archivedProfiles ?? []);
        window.archivedItems = @json($archivedItems ?? []);
        window.editData = {
            student: @json($student ?? null),
            faculty: @json($faculty ?? null),
            course: @json($course ?? null),
            department: @json($department ?? null),
            departments: @json($departments ?? []),
            courses: @json($courses ?? []),
            academicYears: @json($academicYears ?? [])
        };
    </script>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js" integrity="sha256-8aN3gkFiqWdQ1sZ2g7Le3bRlz8OC8G1CnU2YBz2D1v8=" crossorigin="anonymous"></script>
    <script src="{{ asset('js/app.js') }}?v={{ file_exists(public_path('js/app.js')) ? filemtime(public_path('js/app.js')) : time() }}"></script>
</body>
</html>
