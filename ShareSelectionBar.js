import React from "react"
import PropTypes from "prop-types"
import RadioCheckbox from "components/inputs/RadioCheckbox"
import {
    SelectAllProvider,
    SelectedItemsProvider,
} from "containers/SelectableListProvider"
import makeCancelable from "utils/cancelablePromise"
import ButtonGroup from "components/buttons/ButtonGroup"
import { connect } from "react-redux"
import Button from "components/buttons"
import { companiesMeta, getAll } from "models/Company/selectors"
import { updateCampaign, updateForm } from "models/Campaign/actions"
import { inviteContacts } from "models/Contact/actions"
import { replace } from "connected-react-router"
import { showComposeEmail } from "components/ComposeEmail/actions"
import { trackEvents } from "models/Tracking/actions"
import Modal from "components/overlays/Modal"
import "./ShareResumeBook.scss"

const Total = ({ isFetching, total }) => {
    return !isFetching ? (
        <span className="total-results">Total Results : {total}</span>
    ) : null
}
Total.propTypes = {
    isFetching: PropTypes.bool,
    total: PropTypes.number,
}
const totalMapStateToProps = (state) => {
    let metaState = companiesMeta(state.companies)
    return {
        isFetching: metaState.fetching,
        total: metaState.total,
    }
}
const ConnectedTotal = connect(totalMapStateToProps)(Total)

const SelectAll = ({ total, isFetching, items }) => {
    return (
        <SelectAllProvider
            items={items}
            render={({ isSelected, onSelectChange }) => (
                <RadioCheckbox
                    type="checkbox"
                    onChange={onSelectChange}
                    checked={isSelected}
                    label="Select all"
                    readOnly={!total || isFetching}
                    disabled={!total || isFetching}
                />
            )}
        />
    )
}
SelectAll.propTypes = {
    total: PropTypes.number,
    isFetching: PropTypes.bool,
    items: PropTypes.array,
}
const selectAllMapStateToProps = (state, ownProps) => {
    const { invitedList } = ownProps
    let metaState = companiesMeta(state.companies)
    let allItems = getAll(state.companies)
    let items = []
    allItems.map((item) => {
        if (!invitedList.includes(item.id)) items.push(item)
    })
    return {
        isFetching: metaState.fetching,
        total: metaState.total,
        items,
    }
}
const ConnectedSelectAll = connect(selectAllMapStateToProps)(SelectAll)

export class SelectionBar extends React.Component {
    static propTypes = {
        isFetching: PropTypes.bool,
        innerRef: PropTypes.func,
        campaign: PropTypes.object,
        updateForm: PropTypes.func,
        updateCampaign: PropTypes.func,
        inviteContacts: PropTypes.func,
        setOffset: PropTypes.func,
        total: PropTypes.number,
        offset: PropTypes.number,
        replace: PropTypes.func,
        contacts: PropTypes.array,
        showComposeEmail: PropTypes.func,
        fromDetail: PropTypes.bool,
        fromPublish: PropTypes.bool,
        closeModal: PropTypes.func,
        onInvite: PropTypes.func,
        invitedList: PropTypes.array.isRequired,
        trackEvents: PropTypes.func.isRequired,
        fetchCampaignResponse: PropTypes.func,
    }
    constructor(...args) {
        super(...args)
        this.companyIds = []
        this.state = {
            showModal: false,
        }
    }
    componentDidMount() {
        const { innerRef } = this.props
        innerRef && innerRef(this)
    }
    sendEmail = () => {
        const {
            replace,
            contacts,
            showComposeEmail,
            fromDetail,
            fromPublish,
            closeModal,
            campaign,
            onInvite,
        } = this.props
        this.setState({
            showModal: false,
        })
        if (!fromDetail) {
            replace({ pathname: `/campaigns/campaign/${campaign.id}` })
        }
        if (fromPublish) {
            showComposeEmail({
                recipients: [
                    {
                        type: "community-contacts",
                        label: "Contacts",
                        items: contacts,
                    },
                ],
            })
        }
        if (fromDetail) {
            closeModal()
            onInvite()
        }
    }
    /*handleCampaignPublish = () => {
        const { campaign, updateCampaign } = this.props
        this.updatePromise = makeCancelable(
            updateCampaign(campaign.id, { status: "published" })
        )
        this.updatePromise.promise.then((res) => {
            this.setState({
                showModal: true,
            })
        })
    }*/
    handleFormPublish = (companyIds) => {
        const {
            campaign,
            updateForm,
            trackEvents,
            fetchCampaignResponse,
        } = this.props
        let promises = []
        campaign.forms.map((form) => {
            let shareable = []
            companyIds.map((id) => {
                shareable.push({
                    entity_id: id,
                    entity_type: "organization",
                    status: campaign.lifecycle[0].status,
                })
            })
            let params = { shareable }
            promises.push(updateForm(form.id, { ...params }))
        })
        Promise.all(promises).then((arRes) => {
            fetchCampaignResponse && fetchCampaignResponse()
            trackEvents({
                track_type: "event",
                event_category: "Add Companies",
                event_action: "click",
                event_label: "add_companies",
            })
            this.setState({
                showModal: true,
            })
        })
    }
    handlePublish = (companies) => {
        const { inviteContacts } = this.props
        let invitations = []
        companies.map((company, i) => {
            if (company.fk_organization_id) {
                this.companyIds.push(company.fk_organization_id)
            } else {
                company.contacts.map((contact) => {
                    invitations.push({
                        company_id: company.id,
                        contact_id: contact,
                    })
                })
            }
        })
        if (invitations.length !== 0) {
            this.invitePromise = makeCancelable(
                inviteContacts({ invitations: invitations })
            )
            return this.invitePromise.promise.then((res) => {
                let ids = Object.keys(res)
                ids.map((id) => {
                    this.companyIds.push(res[id].fk_organization_id)
                })
                this.handleFormPublish(this.companyIds)
            })
        } else {
            this.handleFormPublish(this.companyIds)
        }
    }
    handleClose = () => {
        const {
            fromDetail,
            closeModal,
            onInvite,
            replace,
            campaign,
        } = this.props
        this.setState({
            showModal: false,
        })
        if (fromDetail) {
            closeModal()
            onInvite()
        } else {
            replace({ pathname: `/campaigns/campaign/${campaign.id}` })
        }
    }
    publishCampaign = () => {
        this.handlePublish(this.getAllCompanies())
    }
    render() {
        const {
            isFetching,
            setOffset,
            total,
            offset,
            fromPublish,
            fromDetail,
            invitedList,
            campaign,
        } = this.props
        return (
            <div className="select-company">
                {!isFetching ? (
                    <span className="select-company-pagination pull-right">
                        <ConnectedTotal />
                        <Button
                            onClick={() => setOffset(-30)}
                            disabled={offset === 0}>
                            <i className="fa fa-chevron-left" />
                        </Button>
                        <span className="page-number">
                            Page : {offset / 30 + 1}
                        </span>
                        <Button
                            onClick={() => setOffset(30)}
                            disabled={offset + 30 > total}>
                            <i className="fa fa-chevron-right" />
                        </Button>
                    </span>
                ) : null}
                <ConnectedSelectAll invitedList={invitedList} />
                <SelectedItemsProvider
                    render={({ count, onRemove, getAll }) => {
                        this.getAllCompanies = getAll
                        return count > 0 ? (
                            <ButtonGroup className="select-company-list-header__actions">
                                <span className="btn text">
                                    Selected: <b>{count}</b>
                                    &nbsp;
                                    <Button
                                        bsStyle="default"
                                        bsSize="sm"
                                        onClick={onRemove}
                                        className="p-l--5px p-r--5px b--none p-t--0 p-b--0"
                                        tip="Unselect all">
                                        <i className="fa fa-remove" />
                                    </Button>
                                </span>
                            </ButtonGroup>
                        ) : null
                    }}
                />
                <Modal
                    onHide={this.handleClose}
                    show={this.state.showModal}
                    backdropClassName="campaign-company-success-modal-backdrop"
                    className="campaign-company-success-modal">
                    <Modal.Header closeButton />
                    <Modal.Body>
                        <div className="campaign-company-success-check">
                            <i
                                className="fa fa-check-circle"
                                aria-hidden="true"
                            />
                        </div>
                        {fromDetail
                            ? campaign.lifecycle[0].status === "drafted"
                                ? "Companies successfully added"
                                : "Interest forms successfully sent"
                            : "Campaign Created Successfully"}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.sendEmail}>
                            {fromPublish ? "Send Email" : "Close"}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    let metaState = companiesMeta(state.companies)
    return {
        isFetching: metaState.fetching,
        campaign: state.campaigns.campaign,
        total: metaState.total,
    }
}

const mapDispatchToProps = {
    updateForm,
    updateCampaign,
    inviteContacts,
    replace,
    showComposeEmail,
    trackEvents,
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SelectionBar)
