import React from "react"
import PropTypes from "prop-types"
import makeCancelable from "utils/cancelablePromise"
import FiltersContainer from "containers/FiltersProvider"
import Filters from "./ShareCompanyFilters"
import FilterBar from "./ShareFilterBar"
import { COMPANY_FILTER_VALIDATION } from "models/Campaign/config"
import { connect } from "react-redux"
//import DeferredRendering from "components/DeferredRendering"
//import InfiniteScrollContainer from "containers/InfiniteScrollContainer"
import { fetchCompaniesForCampaigns } from "models/Company/actions"
import { trackEvents } from "models/Tracking/actions"
import { companiesMeta } from "models/Company/selectors"
import SelectableListProvider from "containers/SelectableListProvider"
import SelectionBar from "./ShareSelectionBar"
import CompanyList from "./CompanyList"
import "./ShareResumeBook.scss"

class ShareCompanyList extends React.Component {
    static propTypes = {
        fetchCompaniesByFilters: PropTypes.func,
        innerRef: PropTypes.func,
        fromDetail: PropTypes.bool,
        closeModal: PropTypes.func,
        // filters: PropTypes.array,
        invitedList: PropTypes.array,
        fromPublish: PropTypes.bool,
        onInvite: PropTypes.func,
        changeCreate: PropTypes.func,
        setCompaniesSelectionStatus: PropTypes.func,
        trackEvents: PropTypes.func.isRequired,
        fetchCampaignResponse: PropTypes.func,
    }
    constructor(...args) {
        super(...args)
        this.state = {
            isResetDone: true,
            page: 1,
            selectedContactsByCompanyId: {},
            showModal: false,
        }
        this.limit = 30
        this.params = {}
    }
    componentDidMount() {
        const { innerRef } = this.props
        innerRef && innerRef(this)
        const { fetchCompaniesByFilters } = this.props
        const filters = this.mapParamsToFilters(this.params)
        if (typeof filters === "boolean") {
            return
        }
        this.offset = 0
        this.setState({
            isFetching: true,
        })
        this.fetchingPromise = makeCancelable(
            fetchCompaniesByFilters({
                ...filters,
                "filters[global_exists]": 1,
                "filters[contact_status]": [
                    "INVITE",
                    "PENDING_OTHERS",
                    "SIGNEDUP_OTHERS",
                    "PENDING_OTHER_COMPANY",
                    "PENDING_SELF",
                    "SIGNEDUP_SELF",
                    "ER_REQUEST_PENDING",
                    "ER_REQUEST_ACCEPTED",
                    "ER_REQUEST_REJECTED",
                    "EMPLOYER_REQUEST_PENDING",
                    "EMPLOYER_REQUEST_ACCEPTED",
                    "EMPLOYER_REQUEST_REJECTED",
                ],
                offset: this.offset,
            })
        )
        this.fetchingPromise.promise
            .then((response) => {
                this.setState({ isFetching: false })
            })
            .catch((error) => {
                this.setState({ isFetching: false })
            })
    }
    fetchCompanies = (params) => {
        this.params = params
        this.fetchCompaniesWithFilters()
    }
    getSizeRange = (value) => {
        const mapping = {
            one: {
                from: 1,
                to: 50,
            },
            fifty: {
                from: 50,
                to: 100,
            },
            hundred: {
                from: 100,
                to: 200,
            },
        }
        if (mapping[value.id]) return mapping[value.id]
        return value
    }
    mapParamsToFilters = (params) => {
        const { trackEvents } = this.props
        let filters = {}
        let toBeTrackedFilters = []
        if (params.q) {
            if (params.q.trim().length <= 1) {
                return false
            } else {
                filters["filters[q]"] = params.q.trim()
                toBeTrackedFilters.push("q")
            }
        }

        if (params.industry) {
            filters["filters[industry_ids]"] = []
            params.industry.map((ind) => {
                filters["filters[industry_ids]"].push(ind.id)
                toBeTrackedFilters.push("industry")
            })
        }
        if (params.location) {
            filters["filters[location_ids]"] = []
            params.location.map((ind) => {
                filters["filters[location_ids]"].push(ind.id)
                toBeTrackedFilters.push("location")
            })
        }
        if (params.tags) {
            filters["filters[tag_ids]"] = []
            params.tags.map((ind) => {
                filters["filters[tag_ids]"].push(ind.id)
                toBeTrackedFilters.push("tags")
            })
        }
        if (params.size) {
            let range = this.getSizeRange(params.size)
            filters["filters[employee_strength][from]"] = range.from
            filters["filters[employee_strength][to]"] = range.to
            toBeTrackedFilters.push("size")
        }
        if (trackEvents) {
            toBeTrackedFilters.map((filter) => {
                trackEvents({
                    track_type: "event",
                    event_category: "Create Campaign - Companies - Filters",
                    event_action: "click",
                    event_label: filter,
                })
            })
        }

        return filters
    }

    publishCampaign = () => {
        return this.fetchCompaniesWithFilters()
    }

    fetchCompaniesWithFilters = () => {
        const { fetchCompaniesByFilters } = this.props
        const filters = this.mapParamsToFilters(this.params)
        if (typeof filters === "boolean") {
            return
        }
        this.offset = 0
        this.setState({
            isFetching: true,
        })
        this.fetchingPromise = makeCancelable(
            fetchCompaniesByFilters({
                ...filters,
                "filters[global_exists]": 1,
                "filters[contact_status]": [
                    "INVITE",
                    "PENDING_OTHERS",
                    "SIGNEDUP_OTHERS",
                    "PENDING_OTHER_COMPANY",
                    "PENDING_SELF",
                    "SIGNEDUP_SELF",
                    "ER_REQUEST_PENDING",
                    "ER_REQUEST_ACCEPTED",
                    "ER_REQUEST_REJECTED",
                    "EMPLOYER_REQUEST_PENDING",
                    "EMPLOYER_REQUEST_ACCEPTED",
                    "EMPLOYER_REQUEST_REJECTED",
                ],
                offset: this.offset,
            })
        )
        this.fetchingPromise.promise
            .then((response) => {
                this.setState({ isFetching: false })
            })
            .catch((error) => {
                this.setState({ isFetching: false })
            })
    }
    handlePagination = (value) => {
        const { fetchCompaniesByFilters } = this.props
        const filters = this.mapParamsToFilters(this.params)
        if (typeof filters === "boolean") {
            return
        }
        this.offset = this.offset + value
        this.setState({
            isFetching: true,
        })
        this.fetchingPromise = makeCancelable(
            fetchCompaniesByFilters({
                ...filters,
                "filters[global_exists]": 1,
                "filters[contact_status]": [
                    "INVITE",
                    "PENDING_OTHERS",
                    "SIGNEDUP_OTHERS",
                    "PENDING_OTHER_COMPANY",
                    "PENDING_SELF",
                    "SIGNEDUP_SELF",
                    "ER_REQUEST_PENDING",
                    "ER_REQUEST_ACCEPTED",
                    "ER_REQUEST_REJECTED",
                    "EMPLOYER_REQUEST_PENDING",
                    "EMPLOYER_REQUEST_ACCEPTED",
                    "EMPLOYER_REQUEST_REJECTED",
                ],
                offset: this.offset,
            })
        )
        this.fetchingPromise.promise
            .then((response) => {
                this.setState({ isFetching: false })
            })
            .catch((error) => {
                this.setState({ isFetching: false })
            })
    }
    handleGetSelectedItems = (get) => {
        const {
            fromDetail,
            changeCreate,
            setCompaniesSelectionStatus,
        } = this.props
        const selectedCompanies = get()
        console.log(selectedCompanies, "selectedCompanies")
        if (selectedCompanies.length !== 0) {
            if (!fromDetail) {
                changeCreate()
            }
        }

        if (setCompaniesSelectionStatus) {
            if (selectedCompanies.length && selectedCompanies.length > 0) {
                setCompaniesSelectionStatus(true)
            } else {
                setCompaniesSelectionStatus(false)
            }
        }

        const {
            selectedContactsByCompanyId: prevSelectedContactsByCompanyId,
        } = this.state
        const selectedContactsByCompanyId = selectedCompanies.reduce(
            (selectedContactsByCompanyId, company) => {
                if (prevSelectedContactsByCompanyId[company.id]) {
                    selectedContactsByCompanyId[company.id] =
                        prevSelectedContactsByCompanyId[company.id]
                }
                return selectedContactsByCompanyId
            },
            {}
        )
        this.setState({
            selectedContactsByCompanyId,
        })
    }
    handleContactSelectionChange = (companyId, contacts) => {
        this.setState(({ selectedContactsByCompanyId }) => ({
            selectedContactsByCompanyId: {
                ...selectedContactsByCompanyId,
                [companyId]: contacts,
            },
        }))
    }
    handleCompanySelectionReset = () => {
        this.setState({
            selectedContactsByCompanyId: {},
        })
    }
    render() {
        const {
            fromDetail,
            closeModal,
            fromPublish,
            onInvite,
            invitedList,
            trackEvents,
            fetchCampaignResponse,
        } = this.props
        const { contacts } = this.state
        console.log(this.props, "invitecomp")
        //////////////////////////////////////////////////////////////
        return (
            <div className="book-share">
                <FiltersContainer
                    resetFilters={{}}
                    autoChange={false}
                    constraints={COMPANY_FILTER_VALIDATION}
                    onChange={this.fetchCompanies}>
                    <div>
                        <div className="book-share-filter">
                            <Filters />
                        </div>
                        <div className="book-share-filterbar">
                            <FilterBar />
                        </div>
                        <SelectableListProvider
                            onChange={this.handleGetSelectedItems}>
                            <div>
                                <div className="book-share-selectionbar">
                                    <SelectionBar
                                        innerRef={(ref) =>
                                            (this.selectionBar = ref)
                                        }
                                        setOffset={this.handlePagination}
                                        onReset={
                                            this.handleCompanySelectionReset
                                        }
                                        offset={this.offset}
                                        contacts={contacts}
                                        onInvite={onInvite}
                                        fromDetail={fromDetail}
                                        closeModal={closeModal}
                                        fromPublish={fromPublish}
                                        invitedList={invitedList}
                                        fetchCampaignResponse={
                                            fetchCampaignResponse
                                        }
                                    />
                                </div>
                                <div className="book-share-company">
                                    <CompanyList
                                        onContactSelectionChange={
                                            this.handleContactSelectionChange
                                        }
                                        fromPublish={fromPublish}
                                        invitedList={invitedList}
                                        trackEvents={trackEvents}
                                    />
                                </div>
                            </div>
                        </SelectableListProvider>
                    </div>
                </FiltersContainer>
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    const { invited } = ownProps
    let invitedList = []
    if (invited) {
        invitedList = invited.map((entity) => entity.company.id)
    }
    return {
        meta: companiesMeta(state.companies),
        length: state.companies.items.length,
        invitedList,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        fetchCompaniesByFilters: (params) =>
            dispatch(
                fetchCompaniesForCampaigns({
                    ...params,
                    with: ["contacts", "tags"],
                })
            ),
        trackEvents: (params) => dispatch(trackEvents(params)),
    }
}
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ShareCompanyList)
