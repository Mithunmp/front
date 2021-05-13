import ajax from "./api"
import downloadFile from "utils/fileDownload"
import { parseServerTimestamp } from "utils/date"
import qs from "qs"

const getPlotDataOverview = (plotData) =>
    plotData.reduce(
        ({ sent, opened, clicked }, { delivered, open, click }) => {
            sent += parseInt(delivered, 10)
            opened += parseInt(open, 10)
            clicked += parseInt(click, 10)
            return {
                sent,
                opened,
                clicked,
            }
        },
        { sent: 0, opened: 0, clicked: 0 }
    )

const getPlotDataTimeline = (plotData) => {
    const { sent, opened, clicked } = plotData.reduce(
        ({ sent, opened, clicked }, { delivered, open, click, date }) => {
            const time = parseServerTimestamp(date).valueOf()
            sent.push([time, parseInt(delivered, 10)])
            opened.push([time, parseInt(open, 10)])
            clicked.push([time, parseInt(click, 10)])
            return {
                sent,
                opened,
                clicked,
            }
        },
        { sent: [], opened: [], clicked: [] }
    )
    return [
        {
            label: "Sent",
            value: sent,
        },
        {
            label: "Opened",
            value: opened,
        },
        {
            label: "Clicked",
            value: clicked,
        },
    ]
}

let cancelQuotaDetailsRequest

export default function StudentAPI(state = {}) {
    const { createAPI, communityId, getCancelToken } = ajax(state)
    const config = {
        baseURL: process.env.SCM_APP_API_STUDENTS_MANAGEMENT_STUDENTS_URL,
    }
    const api = createAPI(config)
    const temp7Config = {
        baseURL: `${process.env.SCM_APP_EMPLOYER_STUDENT_MANAGEMENT_URL}`,
    }
    const additonalUploadsConfig = {
        baseURL: `${process.env.SCM_APP_EMPLOYER_STUDENT_MANAGEMENT_URL}`,
    }
    const studentConfig = {
        baseURL: `${process.env.SCM_APP_EMPLOYER_STUDENT_VIEW_URL}`,
    }
    const jobsAccountConfig = {
        baseURL: `${process.env.SCM_APP_API_JOBS_ACCOUNTS_URL}`,
    }
    const jobsAccountApi = createAPI(jobsAccountConfig)
    const studentApi = createAPI(studentConfig)
    const temp7Api = createAPI(temp7Config)
    const additonalUploadsApi = createAPI(additonalUploadsConfig)

    const reportingConfig = {
        baseURL: process.env.SCM_APP_API_ANALYTICS_REPORTING_URL,
    }
    const reportinApi = createAPI(reportingConfig)

    const applicationTrackingManagementConfig = {
        baseURL: process.env.SCM_APP_API_TRACKING_APPLICATION_MANAGEMENT_URL,
    }

    const applicationTrackingManagementApi = createAPI(
        applicationTrackingManagementConfig
    )

    const configNotes = {
        baseURL: process.env.SCM_APP_API_NOTES_BASE_URL,
    }
    const notesAPI = createAPI(configNotes)

    const configCalendar = {
        baseURL: process.env.SCM_APP_API_APPOINTMENTS_BASE_URL,
    }
    const calendarApi = createAPI(configCalendar)

    const configCommunication = {
        baseURL: process.env.SCM_APP_API_COMMUNICATIONS_URL,
    }
    const communicationApi = createAPI(configCommunication)

    const studentAccountsAPI = createAPI({
        baseURL: `${
            process.env.SCM_APP_EMPLOYER_STUDENT_MANAGEMENT_URL
        }/student-accounts`,
    })

    const universityReviewsAPI = createAPI({
        baseURL: `${
            process.env.SCM_APP_API_RESUME_MANAGEMENT_URL
        }/reviews/university`,
    })

    const entitiesAPI = createAPI({
        baseURL: `${process.env.SCM_APP_API_JOBS_ER_URL}`,
    })

    const userAccountsAPI = createAPI({
        baseURL: `${process.env.SCM_APP_API_ACCOUNTS_URL}`,
    })

    return {
        studentProfileFields: function getMachineNames(params) {
            return studentAccountsAPI.get(
                `/config/groups?${qs.stringify(params)}`
            )
        },

        studentProfileValues: function getValues(studentId) {
            return studentAccountsAPI.get(`/${studentId}`)
        },

        studentProfileEditValues: function editValues(studentId, params) {
            return studentAccountsAPI.patch(`/${studentId}`, params)
        },

        studentProfileSuggestedValues: function suggestedValues(params) {
            return studentAccountsAPI.get(
                `/suggestions?${qs.stringify(params)}`
            )
        },

        studentProfileFieldDetails: function getFieldDetails(studentId) {
            if (studentId) {
                return studentAccountsAPI.get(`/config/fields/${studentId}`)
            } else {
                return studentAccountsAPI.get(`/config/fields`)
            }
        },

        getEntityValues: function getEntityValues(entity) {
            return entitiesAPI.get(`/${entity}`)
        },

        getAllClubs: function getClubs() {
            return userAccountsAPI.get(`/clubs`)
        },

        studentResumeDetails: function getStudentResumeDetails(filters) {
            return universityReviewsAPI.post(
                `/list_with_resume_details?${qs.stringify(filters)}`
            )
        },

        studentSurveyDetails: function getStudentSurveyDetails(
            ids,
            identifiers
        ) {
            return studentApi.get(
                `/app-consumer/products/survey?${qs.stringify(
                    ids
                )}${qs.stringify(identifiers)}`
            )
        },

        studentAccountPossibleValues: function getPossibleValues(
            communityFieldId,
            keyword
        ) {
            return studentAccountsAPI.get(
                `/possible_values?${qs.stringify(
                    communityFieldId
                )}${qs.stringify(keyword)}`
            )
        },

        studentFeaturesSuggestedValues: function getSuggestedValues(valueType) {
            return studentAccountsAPI.get(
                `/feature_suggestions?${qs.stringify(valueType)}`
            )
        },

        all: function allStudents(filters = {}) {
            return api.post(`/students`, filters)
        },
        tags: function studentTags(filters = {}) {
            return api.get(`/students/list/tags`)
        },
        distributionList: function distributionList() {
            return api.get(`/students/list/distributionlist`)
        },
        getResumes: function getStudentResume(params) {
            return api.post(`/students/resumes/zip`, params)
        },
        getProfilePics: function getStudentsProfilePics(params = { ids: [] }) {
            return temp7Api.post(`/profile-pictures`, {
                ...params,
            })
        },
        getBulkProgress: function getStudentBulkProgress(batchId) {
            return api.get(`/students/bulk-actions/${batchId}/progress`)
        },
        getBulkOuput: function getStudentsBulkOuput(batchId, ...args) {
            return downloadFile(
                `${config.baseURL}/students/bulk-actions/${batchId}/output`,
                ...args
            )
        },
        getLatestResume: function getStudentLatestResume(studentId) {
            return api.get(`/student/${studentId}/resumes/latest`)
        },
        downloadLatestResumeFromUrl: downloadFile,
        downloadReport: function downloadReport(params) {
            return downloadFile(`${studentConfig.baseURL}/app-view/export`, {
                params,
                method: "post",
                fileName: params.file_name,
            }).promise.then(() => {
                return Promise.resolve()
            })
        },
        exportAspireData: function exportAspireData(params) {
            return downloadFile(
                `${studentConfig.baseURL}/app-view/aspire/export`,
                { params, method: "post", fileName: "aspire_data.csv" }
            )
        },
        exportData: function getStudentsData(params) {
            return api.post(`/students/csv`, params)
        },
        getJobPrefs: function getStudentsJobPrefs(
            studentId,
            headers = [
                "company",
                "function",
                "industry",
                "location",
                "job_type",
            ]
        ) {
            return Promise.all([
                api.get(`/student/${studentId}/survey-details`),
                api.get(`/student/${studentId}/survey-answers`),
            ]).then((responses) => {
                const questionsData = responses[0].data
                const answersData = responses[1].data
                let questionsWithAnswers = questionsData.questions || []
                let priorityPreferenceQuestionId
                questionsWithAnswers.some((q) => {
                    if (q.question_name === "priority") {
                        priorityPreferenceQuestionId = q.benchmark_question_id
                        return true
                    }
                    return false
                })
                let priorityAnswersKeyValue = {}
                const questionsWithPrioritySet = []
                const questionsWithPriorityNotSet = []
                const priorityAnswers =
                    answersData[priorityPreferenceQuestionId]
                // we have some preferences for priority of answers
                if (priorityAnswers) {
                    // create a mapped key: value order for priority answers
                    priorityAnswersKeyValue = priorityAnswers.reduce(
                        (carry, ans) => {
                            carry[ans.answer] = parseInt(ans.rank, 10)
                            if (ans.answer === "functional_area") {
                                // also map it to function as questions have function as question.header
                                carry["function"] = carry[ans.answer]
                            }
                            return carry
                        },
                        {}
                    )
                }
                // split the questions into two categories for prioritise and non-priorities categories
                questionsWithAnswers
                    // remove the unwanted questions
                    .filter((q) => headers.indexOf(q.question_name) !== -1)
                    .forEach((q) => {
                        const priorityRankForQuestion =
                            priorityAnswersKeyValue[q.question_name]
                        if (priorityRankForQuestion) {
                            questionsWithPrioritySet.push(q)
                        } else {
                            questionsWithPriorityNotSet.push(q)
                        }
                    })
                // sort the questions in the way priority is set
                questionsWithPrioritySet.sort((questionA, questionB) => {
                    const questionAName = questionA.question_name
                    const questionBName = questionB.question_name
                    const priorityRankForQuestionA =
                        priorityAnswersKeyValue[questionAName]
                    const priorityRankForQuestionB =
                        priorityAnswersKeyValue[questionBName]
                    return priorityRankForQuestionA - priorityRankForQuestionB
                })
                // till now, we have qeustionsWithAnswers as a sorted array of questions based on priority
                // now we need to add answers for each question
                // and also need to split the questions into to categories of hasSetPriority and not set priority
                const addAnswers = (qs) =>
                    qs.map((q) => ({
                        id: q.benchmark_question_id,
                        header: q.header,
                        order: priorityAnswersKeyValue[q.question_name],
                        answers: answersData[q.benchmark_question_id] || [],
                        question_name: q.question_name,
                    }))
                return Promise.resolve({
                    withPriorityNotSet: addAnswers(questionsWithPriorityNotSet),
                    withPrioritySet: addAnswers(questionsWithPrioritySet),
                })
            })
        },

        getViewClicks: function getStudentViewClicks({ signupId: signedUpId }) {
            return reportinApi.get(
                `/analytics/students/${signedUpId}/jobs/view-click-count`
            )
        },
        getLastUsedTime: function getStudentViewClicks({
            signupId: signedUpId,
        }) {
            return reportinApi.get(
                `/analytics/students/${signedUpId}/jobs/last-used-total-time`
            )
        },
        getJobsStatsInfo: function getStudentJobStatsInfo(student) {
            return Promise.all([
                this.getViewClicks(student),
                this.getLastUsedTime(student),
            ]).then((responses) => {
                const viewCountResponse = responses[0]
                const timeResponse = responses[1]
                const {
                    data: { viewed, clicked, applied, impressions },
                } = viewCountResponse
                const {
                    data: { last_used: lastUsedOn, time_spent: timeSpent },
                } = timeResponse
                return Promise.resolve({
                    data: {
                        views: (viewed && viewed.doc_count) || 0,
                        clicks: (clicked && clicked.doc_count) || 0,
                        applied: (applied && applied.doc_count) || 0,
                        impressions:
                            (impressions && impressions.doc_count) || 0,
                        timeSpent: timeSpent || 0,
                        lastUsedOn: lastUsedOn,
                    },
                })
            })
        },
        getEmailInteractionOverview: function getStudentEmailInteractionOverview(
            student
        ) {
            return reportinApi
                .get(
                    `/analytics/communities/${communityId}/students/${
                        student.signupId
                    }/emails/interactions`,
                    {
                        params: {
                            emails: [student.email],
                        },
                    }
                )
                .then(({ data }) => {
                    const { plot_data: plotData } = data
                    return Promise.resolve({
                        data: getPlotDataOverview(plotData),
                    })
                })
        },
        getEmailInteractionDetailed: function getStudentEmailInteractionDetailed(
            student
        ) {
            return reportinApi
                .get(
                    `/analytics/communities/${communityId}/students/${
                        student.signupId
                    }/emails/interactions`,
                    {
                        params: {
                            emails: [student.email],
                        },
                    }
                )
                .then(({ data }) => {
                    const { plot_data: plotData } = data
                    return Promise.resolve({
                        data: getPlotDataTimeline(plotData),
                    })
                })
        },
        getEmailInteractionTableDetailed: function getStudentEmailInteractionTableDetailed(
            params
        ) {
            return communicationApi.get(
                `api/v1/communities/${communityId}/email/outbox/interaction`,
                {
                    params,
                }
            )
        },
        getNewsletterInteractionOverview: function getStudentNewsletterEmailInteractionOverview(
            student
        ) {
            return reportinApi
                .get(
                    `/analytics/communities/${communityId}/students/${
                        student.signupId
                    }/newsletters/interactions`,
                    {
                        params: {
                            emails: [student.email],
                        },
                    }
                )
                .then(({ data }) => {
                    const { plot_data: plotData } = data
                    return Promise.resolve({
                        data: getPlotDataOverview(plotData),
                    })
                })
        },
        getNewsletterInteractionDetailed: function getStudentNewsletterInteractionDetailed(
            student
        ) {
            return reportinApi
                .get(
                    `/analytics/communities/${communityId}/students/${
                        student.signupId
                    }/newsletters/interactions`,
                    {
                        params: {
                            emails: [student.email],
                        },
                    }
                )
                .then(({ data }) => {
                    const { plot_data: plotData } = data
                    return Promise.resolve({
                        data: getPlotDataTimeline(plotData),
                    })
                })
        },
        getActivities: function getStudentActivities(params) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve({
                        data: [
                            {
                                created_at: parseServerTimestamp(
                                    "2017-11-01 12:00:00"
                                ),
                                label: "Update Job Preferences",
                            },
                            {
                                created_at: parseServerTimestamp(
                                    "2017-10-01 12:00:00"
                                ),
                                label: "Update Job Preferences",
                            },
                            {
                                created_at: parseServerTimestamp(
                                    "2017-12-01 12:00:00"
                                ),
                                label: "Update Job Preferences",
                            },
                            {
                                created_at: parseServerTimestamp(
                                    "2018-01-01 12:00:00"
                                ),
                                label: "Update Job Preferences",
                            },
                        ],
                    })
                }, 2000)
            })
        },

        getInternalApplications: function getInternalApplications(params) {
            return applicationTrackingManagementApi.get(
                `/v1/application-tracking`,
                {
                    params,
                }
            )
        },

        getClickedExternalJobs: function getClickedExternalJobs(
            student,
            params
        ) {
            return reportinApi
                .get(
                    `/students/${student.signupId}/list/external-jobs-clicked`,
                    {
                        params,
                    }
                )
                .then((response) => {
                    const {
                        data: { results },
                    } = response
                    const { itemsById, uniqueResults } = results.reduce(
                        (
                            { itemsById, uniqueResults },
                            { job_id: id, timestamp }
                        ) => {
                            if (!itemsById[id]) {
                                itemsById[id] = {
                                    id,
                                    clickedOnTimestamps: [timestamp],
                                }
                                uniqueResults.push(id)
                            } else {
                                itemsById[id].clickedOnTimestamps.push(
                                    timestamp
                                )
                            }
                            return {
                                itemsById,
                                uniqueResults,
                            }
                        },
                        { itemsById: {}, uniqueResults: [] }
                    )
                    return Promise.resolve({
                        data: {
                            totalCount: results.length,
                            results: uniqueResults,
                            uniqueCount: uniqueResults.length,
                            itemsById,
                        },
                    })
                })
        },
        getJobDetails: function getJobDetails(ids) {
            return applicationTrackingManagementApi.get(`/v1/job/filter`, {
                params: {
                    ids,
                },
            })
        },
        getJobDetailedEngagement: function getStudentInternalApplications(
            student
        ) {
            return Promise.all([
                this.getLastUsedTime(student),
                this.getInternalApplications({
                    applicant_ids: [student.signupId],
                    limit: 0,
                    offset: 0,
                }),
                this.getClickedExternalJobs(student),
            ]).then((responses) => {
                const timeResponse = responses[0]
                const internalApplicationsResponse = responses[1]
                const clickedExternalResponse = responses[2]
                const {
                    data: { last_used: lastUsedOn, time_spent: timeSpent },
                } = timeResponse
                const {
                    data: { totalCount: totalInternalApplications },
                } = internalApplicationsResponse
                const {
                    data: {
                        uniqueCount: uniqueClickedExternalCount,
                        totalCount: clickedExternalCount,
                    },
                } = clickedExternalResponse
                return {
                    data: {
                        lastUsedOn,
                        timeSpent,
                        totalInternalApplications,
                        clickedExternalCount,
                        uniqueClickedExternalCount,
                    },
                }
            })
        },
        getAttachmentsUrl: function getApplicationAttachmentsUrl(params) {
            return applicationTrackingManagementApi.get(
                `/v1/application-tracking/document/multiple`,
                {
                    params,
                }
            )
        },
        downloadApplicationAttachments: function downloadApplicationAttachments(
            applications
        ) {
            return applicationTrackingManagementApi.get(
                `/v1/application-tracking/document/bulk`,
                {
                    params: {
                        applications,
                    },
                }
            )
        },
        searchStudents: function getStudents(filters, config) {
            return studentApi.post(`/app-view`, filters)
        },
        resumeUploadsRemainingCount: function getResumeUploadsRemainingCount(
            id
        ) {
            return studentApi.get(
                `/app-consumer/products/resume/remaining_count/${id}`
            )
        },
        inactivateStudents: function inactivateStudents(params) {
            return temp7Api.post(
                `/support/admin/student-accounts/access/deactivate/bulk`,
                params
            )
        },
        activateStudents: function activateStudents(params) {
            return temp7Api.post(
                `/support/admin/student-accounts/access/activate/bulk`,
                params
            )
        },
        getStudentOverview: function getStudentOverview(params) {
            return studentApi.get(`/app-view/overview?${qs.stringify(params)}`)
        },
        setAsFlagged: function setStudentsAsFlagged(ids) {
            return temp7Api.post(
                `/update/${ids.length > 1 ? "bulk" : "individual"}/flag/add`,
                {
                    invite_ids: ids,
                }
            )
        },
        unsetFlag: function unsetFlagForStudents(ids) {
            return temp7Api.post(
                `/update/${ids.length > 1 ? "bulk" : "individual"}/flag/remove`,
                {
                    invite_ids: ids,
                }
            )
        },
        getBulkActionDetails: function getBulkActionDetails(id) {
            return temp7Api.get(`/student-actions/${id}`)
        },
        getSupportBulkActionDetails: function getAdminBulkActionDetails(id) {
            return temp7Api.post(`/support/batch`, { batch_id: id })
        },
        updateBenchmark: function updateStudentsBenchmark(data) {
            return temp7Api.post(`/update/bulk/benchmark`, data)
        },
        updateTags: function updateStudentsTags(data) {
            return temp7Api.post(`/update/bulk/tags`, data)
        },
        updateDetails: function updateStudentDetails(data) {
            return temp7Api.post(`/update/individual`, data)
        },
        deleteStudent: function deleteStudent(data) {
            return temp7Api.post(
                `/support/admin/student-accounts/delete/single`,
                data
            )
        },
        deleteBulkStudents: function deleteBulkStudents(data) {
            return temp7Api.post(
                `/support/admin/student-accounts/delete/bulk`,
                data
            )
        },
        mergeStudents: function mergeStudents(data) {
            return temp7Api.post(
                `/support/admin/student-accounts/merge/single`,
                data
            )
        },
        getBatchStatus: function getBatchStatus(id) {
            return temp7Api.get(`/update/bulk/${id}`)
        },
        getBatchDetails: function getBatchDetails(id) {
            return temp7Api.get(`/update/bulk/${id}/details`)
        },
        deleteFromCsv: function deleteFromCsv(data) {
            return temp7Api.post(`/delete/csv`, data, {
                isFormData: true,
            })
        },
        getAppointmentDetails: function getAppointmentDetails(params) {
            return calendarApi.post(
                `api/v2/community/appointments/list/student`,
                params
            )
        },
        getAppointmentStats: function(id) {
            return calendarApi.get(
                `api/v2/community/appointments/student-stats/${id}`
            )
        },
        getEventDetails: function getEventDetails(params) {
            return calendarApi.post(
                `api/v1/community/events/list-for-student`,
                params
            )
        },
        getResumeProductDetails: function getStudentResumeProductDetails(
            params
        ) {
            return studentApi.get("/app-consumer/products/resume/usage", {
                params,
            })
        },
        getResumeFeedback: function getStudentResumeFeedback(id, params = {}) {
            return studentApi.get(
                `/app-consumer/products/resume/${id}/usage?${qs.stringify(
                    params
                )}`
            )
        },
        getResumeTags: function getStudentResumeTags(params) {
            return studentApi.get("resume-tags", {
                params,
            })
        },
        fetchSingleResumeTags: function fetchStudentSingleResumeTags(resumeId) {
            return studentApi.get(`resume/${resumeId}/tags`)
        },
        fetchBulkResumeTags: function fetchStudentBulkResumeTags(resumeId) {
            return studentApi.get(`resume/bulk/tags`, resumeId)
        },
        updateResumeTags: function getStudentResumeTags(resumeId, tags = []) {
            return studentApi.post(
                `/app-consumer/products/resume/${resumeId}/tags`,
                {
                    tags,
                }
            )
        },
        getResumeCompetencyDisplayNames: function getResumeCompetencyDisplayNames() {
            return jobsAccountApi.get(
                "/api/v1/community/resume_competency_display_names"
            )
        },
        getElevatorPitchProductDetails: function getElevatorPitchProductDetails(
            params
        ) {
            return studentApi.get("/app-consumer/products/ep/usage", {
                params,
            })
        },
        getCareerFitProductDetails: function getStudentResumeProductDetails(
            params
        ) {
            return studentApi.get(
                `/app-consumer/products/career-fit/usage?${qs.stringify(
                    params
                )}`
            )
        },
        getCareerFitProductFullFeedback: function getCareerFitProductFullFeedback(
            params,
            config
        ) {
            return studentApi.get(
                `/app-consumer/products/career-fit/full-feedback?${qs.stringify(
                    params
                )}`,
                config
            )
        },
        getRecommendedCareerTracks: function getStudentRecommendedCareerTracks(
            params
        ) {
            return studentApi.get(
                `/app-consumer/products/career-fit/recommended-tracks?${qs.stringify(
                    params
                )}`
            )
        },
        getAspireProductFeedback: function getAspireProductFeedback(params) {
            return studentApi.get(
                `/app-consumer/products/aspire/full-feedback?${qs.stringify(
                    params
                )}`
            )
        },
        getAspireTargetFunctions: function getAspireTargetFunctions(params) {
            return studentApi.get(`/app-view/products/aspire/functions`)
        },

        getCareerPreferences: function getCareerPreferences(params) {
            return studentApi.get(
                `/app-consumer/products/survey?${qs.stringify(params)}`
            )
        },
        getNextStepsForResume: function getNextStepsForResume(id) {
            return studentApi.get(
                `/app-consumer/products/resume/${id}/next-steps`
            )
        },
        getQuotaDetails: function getQuotaDetails(params) {
            if (cancelQuotaDetailsRequest) {
                cancelQuotaDetailsRequest()
                cancelQuotaDetailsRequest = undefined
            }
            return additonalUploadsApi.post(
                `/resume-uploads/student/additional/history`,
                params,
                {
                    cancelToken: getCancelToken((c) => {
                        cancelQuotaDetailsRequest = c
                    }),
                }
            )
        },
        getQuota: function getQuota() {
            return additonalUploadsApi.get(
                `/resume-uploads/quota/active/history`
            )
        },
        addUploads: function addUploads(params) {
            return additonalUploadsApi.post(`/resume-uploads/add`, params)
        },
        getNotes: function getNotes(filters) {
            return notesAPI.get(
                `/api/v1/community/notes/list?${qs.stringify({ filters })}`
            )
        },
        addNote: function addNote(params) {
            return notesAPI.post(`/api/v1/community/notes`, { ...params })
        },
        updateNote: function updateNote(noteId, params) {
            return notesAPI.put(`/api/v1/community/notes/${noteId}`, {
                ...params,
            })
        },
        deleteNote: function deleteNote(noteId) {
            return notesAPI.delete(`/api/v1/community/notes/${noteId}`)
        },
    }
}
