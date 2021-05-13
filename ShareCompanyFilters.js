import React from "react"
import PropTypes from "prop-types"
import SearchInput from "components/inputs/SearchInput"
import LocationSelect from "components/inputs/Select/Location"
import IndustrySelect from "components/inputs/Select/Industry"
import CompanyTags from "components/inputs/Select/CompanyTags"
import Popover from "components/overlays/Popover"
import Media from "react-bootstrap/lib/Media"
import SearchSelect from "components/SearchSelect"
import { FormControl } from "react-bootstrap"
import {
    connectWithFilterItemProvider,
    connectWithAllFiltersProvider,
} from "containers/FiltersProvider"
import FilterButton from "components/buttons/FilterButton"
import "./ShareResumeBook.scss"

class QueryFilter extends React.Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        value: PropTypes.string,
    }

    static defaultProps = {
        value: "",
    }
    handleQueryChange = (e) => {
        const { onChange } = this.props
        if (e.target.value.trim().length || e.target.value.length === 0) {
            onChange(e.target.value)
        }
    }

    render() {
        const { value } = this.props
        return (
            <SearchInput
                placeholder="Search by company name (min 2 characters)"
                value={value}
                maxLength={100}
                bsSize="sm"
                onChange={this.handleQueryChange}
            />
        )
    }
}

const ConnectedQueryFilter = connectWithFilterItemProvider(QueryFilter)

class LocationFilter extends React.Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        value: PropTypes.array,
    }

    static defaultProps = {
        value: [],
    }

    setFilterRef = (ref) => {
        this.filterRef = ref
    }

    handleSelectionChange = (items) => {
        const { onChange } = this.props
        return onChange(items)
    }

    render() {
        // eslint-disable-next-line no-unused-vars
        const { value, onChange, ...otherProps } = this.props
        return (
            <LocationSelect
                {...otherProps}
                onUpdateItems={this.handleSelectionChange}
                useDefaultSelectRendering
                selectedItems={value && value.map((c) => c.id)}
            />
        )
    }
}

const ConnectedLocationAreaFilter = connectWithFilterItemProvider(
    LocationFilter
)

class CompanyTagFilter extends React.Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        value: PropTypes.array,
    }

    static defaultProps = {
        value: [],
    }

    setFilterRef = (ref) => {
        this.filterRef = ref
    }

    handleSelectionChange = (items) => {
        const { onChange } = this.props
        return onChange(items)
    }

    render() {
        // eslint-disable-next-line no-unused-vars
        const { value, onChange, ...otherProps } = this.props
        return (
            <CompanyTags
                {...otherProps}
                onUpdateItems={this.handleSelectionChange}
                useDefaultSelectRendering
                selectedItems={value && value.map((c) => c.id)}
            />
        )
    }
}
const ConnectedCompanyTagFilter = connectWithFilterItemProvider(
    CompanyTagFilter
)

class IndustryFilter extends React.Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        value: PropTypes.array,
    }

    static defaultProps = {
        value: [],
    }

    setFilterRef = (ref) => {
        this.filterRef = ref
    }

    handleSelectionChange = (items) => {
        const { onChange } = this.props
        return onChange(items)
    }

    render() {
        // eslint-disable-next-line no-unused-vars
        const { value = [], onChange, ...otherProps } = this.props

        return (
            <IndustrySelect
                {...otherProps}
                onUpdateItems={this.handleSelectionChange}
                filterRef={this.setFilterRef}
                useDefaultSelectRendering
                selectedItems={value && value.map((c) => c.id)}
            />
        )
    }
}

const ConnectedIndustryFilter = connectWithFilterItemProvider(IndustryFilter)

class Filters extends React.Component {
    static propTypes = {
        fetchCompanies: PropTypes.func,
    }
    handleSearchSubmit = (e) => {
        e.preventDefault()
        const { fetchCompanies } = this.props
        if (fetchCompanies) {
            setTimeout(() => {
                fetchCompanies()
            }, 500)
        }
    }
    render() {
        /////////////////////////////////////////////////////
        return (
            <section
                style={{
                    position: "relative",
                }}>
                <form
                    action="#"
                    method="GET"
                    onSubmit={this.handleSearchSubmit}>
                    <div className="company-filter-container">
                        <div className="company-filter-container-search">
                            <ConnectedQueryFilter filterKey="q" />
                        </div>
                        <div className="company-filter-container-filters">
                            <div className="industry-filter">
                                <Popover
                                    className="company-filter-popover"
                                    popover={
                                        <ConnectedIndustryFilter filterKey="industry" />
                                    }
                                    container={this}>
                                    <FilterButton
                                        wrapperStyle={{
                                            borderLeft: "none",
                                            padding: "0",
                                        }}>
                                        Industry &nbsp;
                                        <i className="fa fa-angle-down fa-fw" />
                                    </FilterButton>
                                </Popover>
                            </div>
                            <div className="location-filter">
                                <Popover
                                    className="company-filter-popover"
                                    popover={
                                        <ConnectedLocationAreaFilter filterKey="location" />
                                    }
                                    container={this}>
                                    <FilterButton
                                        wrapperStyle={{
                                            borderLeft: "none",
                                            padding: "0",
                                        }}>
                                        Headquarters &nbsp;
                                        <i className="fa fa-angle-down fa-fw" />
                                    </FilterButton>
                                </Popover>
                            </div>
                            <div className="tags-filter">
                                <Popover
                                    className="company-list-filter-popover"
                                    popover={
                                        <ConnectedCompanyTagFilter filterKey="tags" />
                                    }
                                    container={this}>
                                    <FilterButton
                                        wrapperStyle={{
                                            borderLeft: "none",
                                            padding: "0",
                                        }}>
                                        Tags &nbsp;
                                        <i className="fa fa-angle-down fa-fw" />
                                    </FilterButton>
                                </Popover>
                            </div>
                        </div>
                    </div>
                </form>
            </section>
        )
    }
}

export default connectWithAllFiltersProvider(Filters)
