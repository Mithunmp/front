import React from "react"
import PropTypes from "prop-types"
import { makeGetVisibleCompanies } from "models/Company/selectors"
import { connect } from "react-redux"
import RadioCheckbox from "components/inputs/RadioCheckbox"
import Popover from "components/overlays/Popover"
import Button from "components/buttons"
import Image from "react-bootstrap/lib/Image"
import DefaultLogo from "static/images/companies/default.png"
import NoCompany from "./nocompany.png"
import SelectableListProvider, {
    SelectAllProvider,
    SelectedItemsProvider,
    ListItemProvider,
} from "containers/SelectableListProvider"
import CompanyCreation from "routes/Companies/containers/CompanyCreationContainer"
import AddContactModal from "routes/Contact/components/AddContactModal"
import { addSingleContact } from "models/Contact/actions"
import Loader from "components/Loader"
import "./ShareResumeBook.scss"
import { Col, Row } from "react-bootstrap"

const colStyles = {
    checkbox: {
        width: "20px",
        paddingTop: "17px",
        paddingLeft: "6px",
    },
    dp: {
        width: "50px",
        verticalAlign: "middle",
    },
    name: {
        width: "250px",
        paddingRight: "0px",
    },
    contacts: {
        width: "145px",
        textAlign: "center",
    },
}

const mapContactTypes = {
    EMPLOYER_REQUEST_REJECTED: "Rejected",
    EMPLOYER_REQUEST_ACCEPTED: "Connected",
    ER_REQUEST_ACCEPTED: "Connected",
    SIGNEDUP_OTHERS: "Registered Employer",
    PENDING_SELF: "Invited",
}

const SelectAll = ({ items }) => {
    return (
        <SelectAllProvider
            items={items}
            render={({ isSelected, onSelectChange }) => (
                <RadioCheckbox
                    type="checkbox"
                    onChange={onSelectChange}
                    checked={isSelected}
                    label=""
                    disabled={!items.length}
                />
            )}
        />
    )
}
SelectAll.propTypes = {
    items: PropTypes.array,
}

export const ContactsList = ({ contacts }) => {
    return (
        <div className="company-list">
            {contacts.map((contact, i) => (
                <div className="company-list-item" key={i}>
                    <ListItemProvider
                        item={contact}
                        render={({ onSelectChange, isSelected }) => (
                            <table
                                className="table select-contact-list-table"
                                style={{ tableLayout: "fixed" }}>
                                <tbody className="word--break">
                                    <tr style={{ height: "55px" }}>
                                        <td
                                            className="media-middle"
                                            style={{
                                                width: "20px",
                                                paddingTop: "8px",
                                                paddingLeft: "6px",
                                            }}>
                                            <RadioCheckbox
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={onSelectChange}
                                            />
                                        </td>
                                        <td className="campaign-invite-contact-detail media-middle">
                                            <div className="campaign-invite-contact-name">
                                                {contact.first_name +
                                                    " " +
                                                    contact.last_name}
                                            </div>
                                            <div className="campaign-invite-contact-position">
                                                {contact.position}
                                            </div>
                                        </td>
                                        <td className="media-middle border-left text-center">
                                            {
                                                mapContactTypes[
                                                    contact.employer_data.status
                                                ]
                                            }
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    />
                </div>
            ))}
        </div>
    )
}

ContactsList.propTypes = {
    contacts: PropTypes.array,
}

class ContactsItem extends React.Component {
    render() {
        const { company, containerRef } = this.props
        return (
            <div className="company-contact-td-container">
                <table>
                    <tbody>
                        <tr>
                            <td className="company-contact-all-select">
                                <SelectAll items={company.contactObjects} />
                            </td>
                            <td className="company-contact-list-select-popover">
                                Selected Contacts
                                <SelectedItemsProvider
                                    render={({ count, onRemove, getAll }) => (
                                        <Popover
                                            className="company-contact-list-popover"
                                            popover={
                                                <ContactsList
                                                    contacts={
                                                        company.contactObjects
                                                    }
                                                />
                                            }
                                            container={containerRef}
                                            positionRight={0}>
                                            <Button
                                                className="company-contact-list-container"
                                                disabled={
                                                    company.contactObjects
                                                        .length === 0
                                                }>
                                                <span className="btn text">
                                                    <b>{count}</b> &nbsp; of
                                                    &nbsp;
                                                    {
                                                        company.contactObjects
                                                            .length
                                                    }
                                                    &nbsp;
                                                </span>
                                                <i className="fa fa-chevron-down fa-fw" />
                                            </Button>
                                        </Popover>
                                    )}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

ContactsItem.propTypes = {
    company: PropTypes.object,
    containerRef: PropTypes.func,
}

const Item = ({ company, onContactSelectionChange, invited }) => {
    let containerRef
    if (invited)
        return (
            <div
                className="company"
                ref={(ref) => {
                    containerRef = ref
                }}
                style={{
                    background: "#ffffff",
                    position: "relative",
                }}>
                <div className="company-image">
                    <Image
                        src={company.logo_url_full || DefaultLogo}
                        alt="LOGO"
                        style={{
                            width: "40px",
                        }}
                        responsive
                        circle
                        thumbnail
                        className="media-object p--0"
                    />
                </div>
                <div className="company-name">{company.name}</div>
            </div>
        )
    return (
        <ListItemProvider
            item={company}
            render={({ onSelectChange, isSelected }) =>
                isSelected ? (
                    <SelectableListProvider
                        onChange={(getItems) =>
                            onContactSelectionChange(company.id, getItems())
                        }
                        render={({ initialize }) => (
                            <Row
                                ref={(ref) => {
                                    containerRef = ref
                                }}
                                className="company"
                                style={{
                                    background: "#ffffff",
                                    position: "relative",
                                }}>
                                <Col md={1} className="company-checkbox">
                                    <RadioCheckbox
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                            initialize()
                                            onSelectChange(e)
                                        }}
                                    />
                                </Col>
                                <Col md={2} className="company-image">
                                    <Image
                                        src={
                                            company.logo_url_full || DefaultLogo
                                        }
                                        alt="LOGO"
                                        style={{
                                            width: "40px",
                                        }}
                                        responsive
                                        circle
                                        thumbnail
                                        className="p--0"
                                    />
                                </Col>
                                <Col md={5} className="company-name">
                                    {company.name}
                                </Col>
                            </Row>
                        )}
                    />
                ) : (
                    <Row className="company">
                        <Col md={1} className="company-checkbox">
                            <RadioCheckbox
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                    onSelectChange(e)
                                }}
                            />
                        </Col>
                        <Col md={2} className="company-image">
                            <Image
                                src={company.logo_url_full || DefaultLogo}
                                alt="LOGO"
                                style={{ width: "40px" }}
                                responsive
                                circle
                                thumbnail
                                className="media-object p--0"
                            />
                        </Col>
                        <Col md={5} className="company-name">
                            {company.name}
                        </Col>
                    </Row>
                )
            }
        />
    )
}

Item.propTypes = {
    company: PropTypes.object,
    onContactSelectionChange: PropTypes.func,
    fromPublish: PropTypes.bool,
    invited: PropTypes.bool,
}

class List extends React.Component {
    static propTypes = {
        companiesByFilters: PropTypes.func,
        fetching: PropTypes.bool,
        onContactSelectionChange: PropTypes.func,
        addSingleContact: PropTypes.func,
        fromPublish: PropTypes.bool,
        invitedList: PropTypes.array,
        trackEvents: PropTypes.func,
    }
    constructor(...args) {
        super(...args)
        this.state = {
            openModal: false,
            openContactModal: false,
        }
    }
    notifyMessage = (message) => {
        if (message) {
            this.setState({
                alert: 1,
                message: message,
            })
        }
    }
    handleClose = () => {
        this.setState({
            openModal: false,
        })
    }
    handleContactClose = () => {
        this.setState({
            openContactModal: false,
        })
    }
    render() {
        const {
            fetching,
            companiesByFilters,
            onContactSelectionChange,
            fromPublish,
            invitedList,
            trackEvents,
        } = this.props
        const companies = companiesByFilters()
        if (fetching) {
            return <Loader />
        }
        return (
            <div>
                {companies.length !== 0 ? (
                    <div className="company-list-container">
                        {companies.map((item, i) => {
                            return (
                                <Item
                                    invited={invitedList.includes(item.id)}
                                    company={item}
                                    key={i}
                                    onContactSelectionChange={
                                        onContactSelectionChange
                                    }
                                />
                            )
                        })}
                        {/* <div className="campaign-company-create">
                            <Button
                                onClick={() =>
                                    this.setState({ openModal: true })
                                }>
                                Create Company
                            </Button>
                        </div>
                        <div className="campaign-contact-create">
                            <Button
                                onClick={() =>
                                    this.setState({ openContactModal: true })
                                }>
                                Create Contact
                            </Button>
                        </div> */}
                    </div>
                ) : (
                    <div className="campaign-company-invite-none">
                        <div className="campaign-company-invite-none-image">
                            <Image
                                src={NoCompany}
                                alt="LOGO"
                                style={{ width: "240px" }}
                                responsive
                                className="media-object p--0"
                            />
                        </div>
                        <div className="campaign-company-invite-none-buttons">
                            <Button
                                onClick={() =>
                                    this.setState({ openModal: true })
                                }>
                                Create Company
                            </Button>
                            <Button
                                onClick={() =>
                                    this.setState({ openContactModal: true })
                                }>
                                Create Contact
                            </Button>
                        </div>
                    </div>
                )}
                <CompanyCreation
                    fetchCompaniesByFilters={companiesByFilters}
                    notifyMessage={this.notifyMessage}
                    onHide={this.handleClose}
                    show={this.state.openModal}
                    trackEvents={trackEvents}
                />
                <AddContactModal
                    show={this.state.openContactModal}
                    listData={{}}
                    onHide={this.handleContactClose}
                    isEdit={false}
                    addSingleContact={this.props.addSingleContact}
                    eventCreatedBy={"campaigns"}
                    trackEvents={trackEvents}
                />
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    const getVisibleCompanies = makeGetVisibleCompanies()
    return {
        companiesByFilters: (filters = {}) =>
            getVisibleCompanies(state.companies, { filters }),
        fetching: state.companies.meta.fetching,
    }
}
const mapDispatchToProps = {
    addSingleContact,
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(List)
