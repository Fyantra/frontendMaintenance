<template>
  <div class="col-12">
    <h2 class="page-title">Form elements</h2>
    <p class="text-muted">
      Demo for form control styles, layout options, and custom components for creating a
      wide variety of forms.
    </p>
    <div class="card shadow mb-4">
      <div class="card-header">
        <strong class="card-title">Form controls</strong>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group mb-3">
              <label for="simpleinput">Text</label>
              <input type="text" id="simpleinput" class="form-control" />
            </div>
            <div class="form-group mb-3">
              <label for="example-email">Email</label>
              <input
                type="email"
                id="example-email"
                name="example-email"
                class="form-control"
                placeholder="Email"
              />
            </div>
            <div class="form-group mb-3">
              <label for="example-password">Password</label>
              <input
                type="password"
                id="example-password"
                class="form-control"
                value="password"
              />
            </div>
            <div class="form-group mb-3">
              <label for="example-palaceholder">Placeholder</label>
              <input
                type="text"
                id="example-palaceholder"
                class="form-control"
                placeholder="placeholder"
              />
            </div>
          </div>
          <!-- /.col -->
          <div class="col-md-6">
            <div class="form-group mb-3">
              <label for="example-helping">Helping text</label>
              <input
                type="text"
                id="example-helping"
                class="form-control"
                placeholder="Input with helping text"
              />
              <span class="help-block"
                ><small>A block of help text that breaks onto a new line.</small></span
              >
            </div>
            <div class="form-group mb-3">
              <label for="example-readonly">Readonly</label>
              <input
                type="text"
                id="example-readonly"
                class="form-control"
                readonly="false"
                value="Readonly value"
              />
            </div>
            <div class="form-group mb-3">
              <label for="example-disable">Disabled</label>
              <input
                type="text"
                class="form-control"
                id="example-disable"
                disabled
                value="Disabled value"
              />
            </div>
            <div class="form-group mb-3">
              <label for="example-static">Static control</label>
              <input
                type="text"
                readonly
                class="form-control-plaintext"
                id="example-static"
                value="j@example.com"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- / .card -->
  </div>
</template>
