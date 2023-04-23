import {db} from './db'
import {asyncCheckModulePrivilege} from "./module";

export const collLessons = db.collection("kechengs_safe")

/**
 * @typedef Lesson
 * @type {object}
 * @property {string} _id - lesson id
 * @property {string} kecheng_name - lesson name
 * @property {string} mid - module id
 * @see https://jsdoc.app/tags-type.html
 */

/**
 *
 * @param lid {string}
 * @returns {Promise<Lesson>}
 */
export const asyncGetLesson = async (lid) => {
	const {data: lesson} = await collLessons.doc(lid).get()
	if (!lesson) throw new Error(`lesson(id=${lid}) not exists`)
	return lesson
}

/**
 *
 * @param lid {string}
 * @return {Promise<boolean>}
 */
export const asyncCheckLessonPrivilege = async (lid) => {
	const lesson = await asyncGetLesson(lid)
	return lesson.kecheng_name.includes("免费") || await asyncCheckModulePrivilege(lesson.mid)
}
