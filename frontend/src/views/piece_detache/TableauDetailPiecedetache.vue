<template>
  <div class="row justify-content-center">
    <div class="col-12">
      <!-- .card-deck -->
      <div class="row align-items-center mb-3 border-bottom no-gutters">
        <div class="col">
          <ul class="nav nav-tabs border-0" id="myTab" role="tablist">
            <li class="nav-item">
              <a
                class="nav-link active"
                id="home-tab"
                data-toggle="tab"
                href="#home"
                role="tab"
                aria-controls="home"
                aria-selected="true"
                >Recent files</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                id="profile-tab"
                data-toggle="tab"
                href="#profile"
                role="tab"
                aria-controls="profile"
                aria-selected="false"
                >Documents</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                id="contact-tab"
                data-toggle="tab"
                href="#contact"
                role="tab"
                aria-controls="contact"
                aria-selected="false"
                >Photos</a
              >
            </li>
          </ul>
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-sm">
            <i class="fe fe-16 fe-grid text-muted"></i>
          </button>
          <button type="button" class="btn btn-sm">
            <i class="fe fe-16 fe-list text-muted"></i>
          </button>
        </div>
      </div>
      <table class="table table-borderless table-striped">
        <thead>
          <tr>
            <th></th>
            <th class="w-50">Name</th>
            <th>Owner</th>
            <th>Last Update</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">
              <div class="circle circle-sm bg-light">
                <span class="fe fe-folder fe-16 text-muted"></span>
              </div>
              <span class="dot dot-md bg-success mr-1"></span>
            </td>
            <th scope="row">
              Admin Template Components<br />
              <span class="badge badge-light text-muted">Folder</span>
            </th>
            <td class="text-muted">Penelope Roy</td>
            <td class="text-muted">Mar 17, 2020</td>
            <td>
              <div class="file-action">
                <button
                  type="button"
                  class="btn btn-link dropdown-toggle more-vertical p-0 text-muted mx-auto"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span class="text-muted sr-only">Action</span>
                </button>
                <div class="dropdown-menu m-2">
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-chevrons-right fe-12 mr-4"></i>Move</a
                  >
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-copy fe-12 mr-4"></i>Copy</a
                  >
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-edit-3 fe-12 mr-4"></i>Rename</a
                  >
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-delete fe-12 mr-4"></i>Delete</a
                  >
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-share fe-12 mr-4"></i>Share</a
                  >
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-download fe-12 mr-4"></i>Download</a
                  >
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="text-center">
              <div class="circle circle-sm bg-light">
                <span class="fe fe-archive fe-16 text-muted"></span>
              </div>
              <span class="dot dot-md bg-warning mr-1"></span>
            </td>
            <th scope="row">
              Template<br />
              <span class="badge badge-light text-muted mr-2">2.2M</span>
              <span class="badge badge-light text-muted">Zip</span>
            </th>
            <td class="text-muted">Cade Beard</td>
            <td class="text-muted">Aug 20, 2020</td>
            <td>
              <div class="file-action">
                <button
                  type="button"
                  class="btn btn-link dropdown-toggle more-vertical p-0 text-muted mx-auto"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span class="text-muted sr-only">Action</span>
                </button>
                <div class="dropdown-menu m-2">
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-chevrons-right fe-12 mr-4"></i>Move</a
                  >
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-copy fe-12 mr-4"></i>Copy</a
                  >
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-edit-3 fe-12 mr-4"></i>Rename</a
                  >
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-delete fe-12 mr-4"></i>Delete</a
                  >
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-share fe-12 mr-4"></i>Share</a
                  >
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-download fe-12 mr-4"></i>Download</a
                  >
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="text-center">
              <div class="circle circle-sm bg-light">
                <span class="fe fe-film fe-16 text-muted"></span>
              </div>
              <span class="dot dot-md bg-success mr-1"></span>
            </td>
            <th scope="row">
              Creative Logo<br />
              <span class="badge badge-light text-muted mr-2">1G</span>
              <span class="badge badge-light text-muted">Mp4</span>
            </th>
            <td class="text-muted">Whilemina Pate</td>
            <td class="text-muted">Oct 10, 2019</td>
            <td>
              <div class="file-action">
                <button
                  type="button"
                  class="btn btn-link dropdown-toggle more-vertical p-0 text-muted mx-auto"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span class="text-muted sr-only">Action</span>
                </button>
                <div class="dropdown-menu m-2">
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-chevrons-right fe-12 mr-4"></i>Move</a
                  >
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-copy fe-12 mr-4"></i>Copy</a
                  >
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-edit-3 fe-12 mr-4"></i>Rename</a
                  >
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-delete fe-12 mr-4"></i>Delete</a
                  >
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-share fe-12 mr-4"></i>Share</a
                  >
                  <a class="dropdown-item" href="#"
                    ><i class="fe fe-download fe-12 mr-4"></i>Download</a
                  >
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
