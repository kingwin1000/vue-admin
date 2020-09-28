const host = process.env.VUE_APP_BASE_API
export default {
  categoryListUrl: `${host}/course_category/index`,
  getOneUrl: `${host}/course_category/one`,
  addUrl: `${host}/course_category/add`,
  removeUrl: `${host}/course_category/remove`,
  editUrl: `${host}/course_category/edit`,
  listPropertyUrl: `${host}/property/index`,
  getOnePropertyUrl: `${host}/property/one`,
  addPropertyUrl: `${host}/property/add`,
  removePropertyUrl: `${host}/property/remove`,
  editPropertyUrl: `${host}/property/edit`,	

  getMenuUrl: `${host}/api/school/basic/menu`,
  listUrl: `${host}/api/school/role/index`,
  addRoleUrl: `${host}/api/school/role/save`,
  delRoleUrl: `${host}/api/school/role/delete`,
  editRoleUrl: `${host}/api/school/role/edit`,
  getAuthListUrl: `${host}/api/school/role/authList`,
  setAuthUrl: `${host}/api/school/role/auth`,
  adminIndexUrl: `${host}/api/school/admin/index`,
  addManageUrl: `${host}/api/school/admin/save`,
  editAdminUrl: `${host}/api/school/admin/edit`,
  delAdminUrl: `${host}/api/school/admin/delete`,
  
  listSchoolUrl: `${host}/api/school/school/index`,
  editSchoolUrl: `${host}/api/school/school/edit`,
  getSchoolUrl: `${host}/api/school/school/get`,
  setSchoolUrl: `${host}/api/school/school/set`,

  
}
