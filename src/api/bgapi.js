const host = process.env.VUE_APP_BASE_API
export default {
	host: host,
  menu: `${host}/api/menu`,
	menuAuth: `${host}/api/menuAuth`,
	adminRoles: `${host}/api/adminRoles`,
	adminList: `${host}/api/adminList`,
	resources:`${host}/api/resources`,
	delManyRes:`${host}/api/delManyRes`,
	contentCate:`${host}/api/contentCategories`,
	contentTags:`${host}/api/contentTags`,
	content:`${host}/api/content`,
	delManyContent:`${host}/api/delManyContent`,
	channel:`${host}/api/channel`,
	addChannelCate:`${host}/api/addChannelCate`,
	getChannelCate:`${host}/api/getChannelCate`,	
	addChannelSetting:`${host}/api/addChannelSetting`,
}
