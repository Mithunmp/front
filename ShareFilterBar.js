import React from "react"
import PropTypes from "prop-types"
import FiltersBar from "components/FiltersBar"
import getDisplayName from "utils/getDisplayName"
import {
    FilterItemProvider,
    connectWithAllFiltersProvider,
} from "containers/FiltersProvider"
//import "./FilterStyles.scss"

const FilterBarItem = FiltersBar.Item

const connectWithFilterItem = (WrappedComponent, labelKey) => {
    function WrapperComponent(props) {
        return (
            <FilterItemProvider
                {...props}
                render={(props) => (
                    <WrappedComponent labelKey={labelKey} {...props} />
                )}
            />
        )
    }

    WrapperComponent.displayName = `WithFilter(${getDisplayName(
        WrappedComponent
    )})`

    return WrapperComponent
}

class QueryFilter extends React.Component {
    static propTypes = {
        value: PropTypes.string,
    }
    render() {
        const { value } = this.props
        if (!value || !value.trim()) {
            return null
        }
        return <FilterBarItem {...this.props} value={value.trim()} />
    }
}

class TagsFilter extends React.Component {
    static propTypes = {
        value: PropTypes.array,
    }

    render() {
        const { value } = this.props
        if (!value || !value.length) {
            return null
        }
        return <FilterBarItem {...this.props} multi />
    }
}

const ConnectedQueryFilter = connectWithFilterItem(QueryFilter)
const ConnectedTagsFilter = connectWithFilterItem(TagsFilter)

class SizeFilter extends React.Component {
    static propTypes = {
        value: PropTypes.object,
    }
    valueRenderer = (v) => `From: ${v.from} To: ${v.to}`

    render() {
        const { value } = this.props
        if (!value) {
            return null
        }
        if (value.id && value.name) {
            return <FilterBarItem {...this.props} />
        }
        if (value.from || value.to) {
            return (
                <FilterBarItem
                    {...this.props}
                    valueRenderer={this.valueRenderer}
                />
            )
        }
    }
}

const ConnectedSizeFilter = connectWithFilterItem(SizeFilter)

export class FilterBar extends React.Component {
    static propTypes = {
        onReset: PropTypes.func.isRequired,
        getValidFilters: PropTypes.func.isRequired,
    }

    render() {
        const { onReset, getValidFilters } = this.props
        const filters = getValidFilters()
        const {
            limit, // eslint-disable-line no-unused-vars
            page, // eslint-disable-line no-unused-vars
            module, // eslint-disable-line no-unused-vars
            ...otherFilters
        } =
            filters || {}
        const areAnyFiltersApplied = Object.keys(otherFilters).length
        if (!areAnyFiltersApplied) {
            return null
        }
        return (
            <FiltersBar className="campaign-company-invite-filters">
                <ConnectedQueryFilter filterKey="q" label="Keyword" />
                <ConnectedTagsFilter filterKey="industry" label="Industry" />
                <ConnectedTagsFilter
                    filterKey="location"
                    label="Headquarters"
                />
                <ConnectedSizeFilter filterKey="size" label="Size" />
                <ConnectedTagsFilter filterKey="tags" label="Tags" />
                <FiltersBar.Item
                    isWholeAction
                    actionLabel={"Reset"}
                    onChange={onReset}
                />
            </FiltersBar>
        )
    }
}

export default connectWithAllFiltersProvider(FilterBar)
