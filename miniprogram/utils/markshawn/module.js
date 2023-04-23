import {db} from './db'
import {asyncGetUser} from "./user";

export const collModuleGroups = db.collection("module_groups")
export const collModules = db.collection("super_modules")

/**
 * @typedef LessonModule
 * @type {object}
 * @property {string} _id - module id
 * @property {string} group_id - parent id of its module_group
 * @property {string} module_name
 * @property {number} module_price
 * @see https://jsdoc.app/tags-type.html
 */

/**
 *
 * @param mid {string}
 * @return {Promise<LessonModule>}
 */
export const asyncGetLessonModule = async (mid) => {
	const {data: lessonModule} = await collModules.doc(mid).get()
	if (!lessonModule) throw new Error(`module of ${mid} not exist`)
	return lessonModule
}

/**
 *
 * @param mid {string}
 * @return {Promise<boolean>}
 */
export const asyncCheckModulePrivilege = async (mid) => {
	const user = await asyncGetUser()
	const module = await asyncGetLessonModule(mid)
	return module.module_price === 0 || user.m_clearance.includes(module._id)
}
