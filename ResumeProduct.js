import React from "react"
import PropTypes from "prop-types"
import ReactDOM from "react-dom"
import { connect } from "react-redux"
import { Switch, Redirect, Route, Link } from "react-router-dom"
import {
    Table,
    Media,
    Collapse,
    OverlayTrigger,
    Tooltip,
} from "react-bootstrap"
import Styled, { css } from "styled-components"
import "./ViewStyles.scss"
import _ from "lodash"
import moment from "moment"

import Popover from "components/overlays/Popover"
import Overlay from "react-bootstrap/lib/Overlay"
import Button from "components/buttons"
import NavLink from "components/NavLink"
import Modal from "components/overlays/Modal"
import { showComposeEmail } from "components/ComposeEmail/actions"
import Loader from "components/Loader"
import { trackEvents } from "models/Tracking/actions"
import ConnectedPermission, {
    PERMISSIONS,
} from "containers/ConnectedPermission"
import IsCvProvider from "containers/IsCvProvider"

import {
    Loading as ProductLoading,
    NoData as NoProductData,
} from "./ProductZeros"
import {
    Collapsible,
    CollapsibleGroup,
    CollapsibleProvider,
} from "./Collapsible"

import {
    getResumeProductDetails,
    getResumeFeedback,
    fetchNextStepsResume,
    fetchResumeTags,
    updateResumeTags,
    fetchSingleResumeTags,
    fetchBulkResumeTags,
    getResumeCompetencyDisplayNames,
} from "./../../../modules/actions"
import { reviewRequest } from "../../List/modules/actions"
import { fetchResumeUploadsRemainingCount } from "routes/StudentAnalytics/modules/actions"

import { NetworkFeedbackDropdown } from "./NetworkFeedbacks"
import ResumeProvider, { ViewResume } from "./Resume"
import ZeroResume from "./../assets/zero-resume.png"
import ZeroCV from "./../assets/zero-cv.png"
import ResumeIcon from "./../assets/resume.svg"
import ZeroNextSteps from "./../assets/newsletter-zero-icon.svg"

import { ZONES, ResumeState } from "./utils"
import EditTagsModal from "../../../components/EditTagsModal"

// on admin side, we only show 0 or 2 for overall feedback
const modifiedType = (type) => (type === 2 ? type : type)

const getColor = (type) => {
    let color = ""
    if (type === 0) {
        color = "#db3726"
    } else if (type === 1) {
        color = "#fa8a2f"
    } else if (type === 2) {
        color = "#0f8663"
    }
    return color
}

const getMessage = (type) => {
    let message = ""
    if (type === 0) {
        message = "Needs Work"
    } else if (type === 1) {
        message = "On Track"
    } else if (type === 2) {
        message = "Good Job"
    }
    return message
}

const getBlfAndNfRequestMesage = (blfUsed, nfRequested) => {
    let message = "Hasn't explored "
    if (blfUsed === "No") message += "Bullet Level "
    if (blfUsed === "No" && nfRequested === "Not Requested") message += "and "
    else if (blfUsed === "No" && nfRequested !== "Not Requested")
        message += "Feedback "
    if (nfRequested === "Not Requested") message += "Network Feedback "
    message += "yet"
    if (blfUsed === "Yes" && nfRequested !== "Not Requested") return null
    return message
}

function formatText(str) {
    let obj = {}
    try {
        obj = JSON.parse(str)
    } catch (e) {
        return <div className="para">{str}</div>
    }
    let classNameMapping = { bold: "-bold", underline: "-underline" }
    return (
        <div className="para">
            {_.map(obj, function(line, index) {
                let text = line.text
                if (!text) {
                    return null
                }

                let className = ""
                if (line.type) {
                    if (line.type.indexOf("bullet") > -1) {
                        return (
                            <ul>
                                <li>{text}</li>
                            </ul>
                        )
                    } else {
                        _.map(line.type, (type) => {
                            className += `suggestion-text-formatting${classNameMapping[
                                type
                            ] || ""} `
                        })

                        return <div className={className}>{text}</div>
                    }
                } else {
                    return <div>{text}</div>
                }
            })}
        </div>
    )
}

function withColorForType(Component) {
    return Styled(Component)`
        color: ${(props) => ZONES[props.type]}
    `
}
const IconForType = withColorForType(function IconForType({
    type,
    circle,
    className = "",
}) {
    let iconClassName = ""
    switch (type) {
        case 0:
            iconClassName = `fa-times${circle ? "-circle-o" : ""}`
            break
        case 1:
            iconClassName = `fa-exclamation${circle ? "-circle" : ""}`
            break
        case 2:
            iconClassName = `fa-check${circle ? "-circle-o" : ""}`
            break
        default:
            iconClassName = "fa-question"
            break
    }
    return <i className={`${className} fa ${iconClassName}`} />
})
IconForType.propTypes = {
    type: PropTypes.number.isRequired,
    circle: PropTypes.bool,
}

const BaseStyledPopover = Styled(Popover)`
    &.popover {
        border-radius: 5px;
        box-shadow: 0 3px 5px 0 rgba(187, 185, 185, 0.5);
        border: solid 1px #dedddd;
        background-color: #ffffff;
        max-width: 250px;
        color: #2a2a2a;
        > .arrow {
            display: none;
        }
    }
`

const ImpactItemFeedbackStyled = Styled(BaseStyledPopover)`
    &.popover {
        padding: 15px;
        font-size: 12px;
    }
    h4 {
        font-size: 12px;
        font-weight: 600;
        margin: 0;
    }
    p {
        margin: 8px 0;
    }
    .badge {
        background-color: #2a2a2a;
        border-radius: 10.5px;
        padding: 2px 8px;
        display: inline-block;
        margin: -5px 5px 10px 0;
        color: white;
        font-size: 12px;
        font-weight: normal;
        line-height: 16px;
    }
`
const ImpactItemFeedback = ({ label, feedback, type }) => (
    <ImpactItemFeedbackStyled
        placement="right"
        popover={
            <div>
                <h4>{label}</h4>
                {!_.isEmpty(feedback)
                    ? feedback.map((f) => {
                          return (
                              <div key={f.text}>
                                  <p>{f.text}</p>
                                  {!_.isEmpty(f.sections)
                                      ? (f.sections || []).map((s) => (
                                            <span key={s} className="badge">
                                                {s}
                                            </span>
                                        ))
                                      : null}
                                  {_.map(f.keywords, (times, keyword) => (
                                      <span key={keyword} className="badge">
                                          {keyword}
                                          {"  "}({times})
                                      </span>
                                  ))}
                              </div>
                          )
                      })
                    : null}
            </div>
        }>
        <Button>
            <IconForType type={modifiedType(type)} circle />
            {label}
        </Button>
    </ImpactItemFeedbackStyled>
)
ImpactItemFeedback.propTypes = {
    label: PropTypes.node.isRequired,
    feedback: PropTypes.array.isRequired,
    type: PropTypes.number.isRequired,
}

const FeedbackSubSectionStyles = Styled.ul`
    list-style: none;
    padding: 0;
    margin: 0 auto;
    max-width: 200px;
    > li {
        + li {
            margin-top: 15px;
        }
        > button {
            display: block;
            width: 100%;
            padding: 12px 15px;
            text-align: left;
            border: solid 1px #eeeeee;
            border-radius: 8px;
            background-color: #ffffff;
            transition: all linear .15s;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            @media only screen and (max-width: 991px){
                padding: 10px 5px;
                font-size:12px;
            }
            &:after {
                content: "\f054";
                display: inline-block;
                float: right;
                font: normal normal normal 14px/1;
                font-family: "FontAwesome", sans-serif;
                line-height: inherit;
                @media only screen and (max-width: 991px){
                    font-size: 8px;
                    margin-top: 3px;
                }
            }
            &:focus, &:active, &:hover, &:focus:hover, &[aria-describedby^=popover] {
                outline: none;
                box-shadow: 0 3px 5px 0 rgba(187, 185, 185, 0.5);
                background: white;
                border-color: #dedddd;
            }
            i {
                margin-right: 15px;
                font-size: 20px;
                vertical-align: middle;
                @media only screen and (max-width: 991px){
                    margin-right:5px;
                    font-size:15px;
                }
            }
        }
    }
`

const hasFeedback = (feedback) => feedback && !_.isEmpty(feedback)

const Impact = ({ feedback }) => {
    if (!hasFeedback(feedback)) return null
    const { action, avoided, overusage, specifics } = feedback
    return (
        <FeedbackSubSectionStyles>
            {action ? (
                <li>
                    <ImpactItemFeedback label="Action Oriented" {...action} />
                </li>
            ) : null}
            {specifics ? (
                <li>
                    <ImpactItemFeedback label="Specifics" {...specifics} />
                </li>
            ) : null}
            {overusage ? (
                <li>
                    <ImpactItemFeedback label="Over Usage" {...overusage} />
                </li>
            ) : null}
            {avoided ? (
                <li>
                    <ImpactItemFeedback label="Avoided Words" {...avoided} />
                </li>
            ) : null}
        </FeedbackSubSectionStyles>
    )
}
Impact.propTypes = {
    feedback: PropTypes.object,
}

const EssentialSectionStyled = Styled.div`
    padding: 15px;
    font-size: 11px;
    color: #2a2a2a;
    max-width: 250px;
    h4 {
        font-size: 12px;
        font-weight: 600;
        color: #2a2a2a;
        margin: 0 0 15px 0;
    }
    > ul {
        padding: 0;
        list-style: none;
        margin: 0;
        > li {
            + li {
                margin-top: 8px;
            }
            > ul {
                margin: 0 0 0 15px;
                padding: 0;
                list-style: none;
                > li {
                    font-weight: 500;
                    font-size: 12px;
                    + li {
                        margin-top: 12px;
                    }
                }
            }
            > .para {
                margin: 15px 0 0;
                font-weight: 500;
                ul {
                    padding-inline-start: 15px;
                    li {
                        padding: 5px;
                    }
                }
            }
        }
    }
`

const EssentialSection = ({ feedback }) => (
    <EssentialSectionStyled>
        <h4>{feedback.display_name}</h4>
        {!_.isEmpty(feedback.pchecks) ? (
            <ul>
                {_.map(feedback.pchecks, (pCheck, key) => {
                    return (
                        <li key={key}>
                            <ul>
                                {!_.isEmpty(pCheck.subcheckStatus)
                                    ? _.map(
                                          pCheck.subcheckStatus,
                                          function subcheckStatusMapper(
                                              { name, type },
                                              i
                                          ) {
                                              return (
                                                  <li key={i}>
                                                      <IconForType
                                                          type={type}
                                                      />
                                                      {name.join(", ")}
                                                  </li>
                                              )
                                          }
                                      )
                                    : null}
                            </ul>
                            {formatText(pCheck.text)}
                        </li>
                    )
                })}
            </ul>
        ) : null}
    </EssentialSectionStyled>
)

EssentialSection.propTypes = {
    feedback: PropTypes.object.isRequired,
}

const StyledNumberOfPages = Styled.div`
    font-size: 12px;
    padding: 15px;
    h4 {
        font-size: 12px;
        margin: 0 0 8px 0;
    }
    p {
        margin: 0;
    }
`

const NumberOfPages = ({ feedback }) => (
    <StyledNumberOfPages>
        <h4>{feedback.display_name}</h4>
        <p>{feedback.text}</p>
    </StyledNumberOfPages>
)
NumberOfPages.propTypes = {
    feedback: PropTypes.object.isRequired,
}

const StyledOverallFormat = Styled.div`
    font-size: 12px;
    color: #2a2a2a;
    max-height: 40vh;
    overflow: auto;
    > h4 {
        font-size: 12px;
        margin: 0 0 8px 0;
    }
    .unindented-list {
        margin: 0;
        padding: 0;
        > li {
            font-weight: 500;
            padding: 15px;
            .media-left {
                padding: 0;
                min-width: 22px;
            }
            .para {
                margin: 5px 0 0;
                font-weight: normal;
                ul {
                    padding-inline-start: 15px;
                    li {
                        padding: 5px;
                    }
                }
            }
            + li {
                border-top: 1px solid #dedddd;
            }
        }
    }
`

const OverallFormat = ({ feedback }) => (
    <StyledOverallFormat>
        <ul className="unindented-list">
            {hasFeedback(feedback.pchecks)
                ? _.map(feedback.pchecks, function pcheckMap({
                      display_name: name,
                      text,
                      type,
                  }) {
                      return (
                          <li key={name}>
                              <Collapsible
                                  render={({ isCollapsed, onToggle }) => (
                                      <Media onClick={onToggle} role="button">
                                          <Media.Left>
                                              <IconForType type={type} />
                                          </Media.Left>
                                          <Media.Body>{name}</Media.Body>
                                      </Media>
                                  )}>
                                  <div>
                                      <Media>
                                          <Media.Left />
                                          <Media.Body>
                                              {formatText(text)}
                                          </Media.Body>
                                      </Media>
                                  </div>
                              </Collapsible>
                          </li>
                      )
                  })
                : null}
        </ul>
    </StyledOverallFormat>
)
OverallFormat.propTypes = {
    feedback: PropTypes.object.isRequired,
}

const StyledSectionSpecifics = Styled.div`
    font-size: 12px;
    color: #2a2a2a;
    min-width: 250px;
    max-height: 40vh;
    overflow: auto;
    > h4 {
        font-size: 12px;
        margin: 0 0 8px 0;
        padding: 0 15px;
    }
    > p {
        padding: 0 15px;
        margin: 0 0 8px 0;
    }
    > ul {
        list-style: none;
        padding: 0;
        margin: 0;
        .media-left {
            padding: 0;
            min-width: 22px;
        }
        > li {
            padding: 15px;
            font-weight: 600;
            + li {
                border-top: 1px solid #dedddd;
            }
            ul {
                margin: 0;
                padding: 0;
                list-style: none;
                font-weight: 500;
                > li {
                    margin-top: 12px;
                    .para {
                        margin: 5px 0 0;
                        font-weight: normal;
                        font-size: 11px;
                        ul {
                            padding-inline-start: 15px;
                            li {
                                padding: 5px;
                            }
                        }
                    }
                }
            }
        }
    }
`

const SectionSpecifics = ({ feedback }) => (
    <StyledSectionSpecifics>
        <CollapsibleGroup defaultExpandedKey={0}>
            <ul>
                {hasFeedback(feedback.checks)
                    ? _.map(feedback.checks, function mapChecks(
                          { sectionName, type, pchecks },
                          i
                      ) {
                          return (
                              <li key={sectionName}>
                                  <CollapsibleProvider
                                      eventKey={i}
                                      render={({ onChange, isExpanded }) => (
                                          <div>
                                              <Media
                                                  role="button"
                                                  onClick={onChange}>
                                                  <Media.Left>
                                                      <IconForType
                                                          type={type}
                                                      />
                                                  </Media.Left>
                                                  <Media.Body>
                                                      {sectionName}
                                                  </Media.Body>
                                              </Media>
                                              <Collapse in={isExpanded}>
                                                  <div>
                                                      <Media>
                                                          <Media.Left />
                                                          <Media.Body>
                                                              <ul>
                                                                  {hasFeedback(
                                                                      pchecks
                                                                  )
                                                                      ? _.map(
                                                                            pchecks,
                                                                            function mapPChecks({
                                                                                display_name: name,
                                                                                text,
                                                                                type,
                                                                            }) {
                                                                                return (
                                                                                    <li
                                                                                        key={
                                                                                            name
                                                                                        }>
                                                                                        <Collapsible
                                                                                            render={({
                                                                                                onToggle,
                                                                                            }) => (
                                                                                                <Media
                                                                                                    role="button"
                                                                                                    onClick={
                                                                                                        onToggle
                                                                                                    }>
                                                                                                    <Media.Left>
                                                                                                        <IconForType
                                                                                                            type={
                                                                                                                type
                                                                                                            }
                                                                                                        />
                                                                                                    </Media.Left>
                                                                                                    <Media.Body>
                                                                                                        {
                                                                                                            name
                                                                                                        }
                                                                                                    </Media.Body>
                                                                                                </Media>
                                                                                            )}>
                                                                                            <div>
                                                                                                <Media>
                                                                                                    <Media.Left />
                                                                                                    <Media.Body>
                                                                                                        {formatText(
                                                                                                            text
                                                                                                        )}
                                                                                                    </Media.Body>
                                                                                                </Media>
                                                                                            </div>
                                                                                        </Collapsible>
                                                                                    </li>
                                                                                )
                                                                            }
                                                                        )
                                                                      : null}
                                                              </ul>
                                                          </Media.Body>
                                                      </Media>
                                                  </div>
                                              </Collapse>
                                          </div>
                                      )}
                                  />
                              </li>
                          )
                      })
                    : null}
            </ul>
        </CollapsibleGroup>
    </StyledSectionSpecifics>
)
SectionSpecifics.propTypes = {
    feedback: PropTypes.object.isRequired,
}

const StyledSpellCheck = Styled.div`
    padding: 15px;
    font-size: 12px;
    color: #2a2a2a;
    h4 {
        font-size: 12px;
        font-weight: 600;
        margin: 0 0 8px 0;
    }
    .badge {
        background-color: #2a2a2a;
        border-radius: 10.5px;
        padding: 2px 8px;
        display: inline-block;
        margin: 5px 5px 0 0;
        color: white;
        font-size: 12px;
        font-weight: normal;
        line-height: 16px;
    }
`

const SpellCheck = ({ feedback }) => (
    <StyledSpellCheck>
        <h4>{feedback.display_name}</h4>
        <span>{feedback.text}</span>
        {hasFeedback(feedback.pchecks) &&
        hasFeedback(feedback.pchecks.SPELL_CHECK) &&
        hasFeedback(feedback.pchecks.SPELL_CHECK.suggestion) ? (
            <span>
                &nbsp;However, we recommend that you re-examine the spelling of
                the same once.
                <br />
                {_.reduce(
                    feedback.pchecks.SPELL_CHECK.suggestion,
                    function reduceSpellChecks(carry, spells, key) {
                        return carry.concat(
                            spells.map(({ keyword }) => (
                                <span key={keyword} className="badge">
                                    {keyword}
                                </span>
                            ))
                        )
                    },
                    []
                )}
            </span>
        ) : null}
    </StyledSpellCheck>
)
SpellCheck.propTypes = {
    feedback: PropTypes.object.isRequired,
}

const PresentationStyledItemPopover = Styled(BaseStyledPopover)`
    i {
        margin-right: 9px;
    }
`

const Presentation = ({ feedback }) => {
    if (!hasFeedback(feedback)) return null
    const {
        EssentialSections: EssentialSectionsFeedback,
        FormatStandards: FormatStandardsFeedback,
        NumberOfPages: NumberOfPagesFeedback,
        SectionSpecifics: SectionSpecificsFeedback,
        SpellCheck: SpellCheckFeedback,
    } = feedback
    return (
        <FeedbackSubSectionStyles>
            {hasFeedback(NumberOfPagesFeedback) ? (
                <li>
                    <PresentationStyledItemPopover
                        placement="right"
                        popover={
                            <NumberOfPages feedback={NumberOfPagesFeedback} />
                        }>
                        <Button>
                            <IconForType
                                circle
                                type={modifiedType(NumberOfPagesFeedback.type)}
                            />
                            {NumberOfPagesFeedback.display_name}
                        </Button>
                    </PresentationStyledItemPopover>
                </li>
            ) : null}
            {hasFeedback(EssentialSectionsFeedback) ? (
                <li>
                    <PresentationStyledItemPopover
                        placement="right"
                        popover={
                            <EssentialSection
                                feedback={EssentialSectionsFeedback}
                            />
                        }>
                        <Button>
                            <IconForType
                                type={modifiedType(
                                    EssentialSectionsFeedback.type
                                )}
                                circle
                            />
                            {EssentialSectionsFeedback.display_name}
                        </Button>
                    </PresentationStyledItemPopover>
                </li>
            ) : null}
            {hasFeedback(FormatStandardsFeedback) ? (
                <li>
                    <PresentationStyledItemPopover
                        placement="right"
                        popover={
                            <OverallFormat feedback={FormatStandardsFeedback} />
                        }>
                        <Button>
                            <IconForType
                                circle
                                type={modifiedType(
                                    FormatStandardsFeedback.type
                                )}
                            />
                            {FormatStandardsFeedback.display_name}
                        </Button>
                    </PresentationStyledItemPopover>
                </li>
            ) : null}

            {hasFeedback(SectionSpecificsFeedback) ? (
                <li>
                    <PresentationStyledItemPopover
                        placement="right"
                        popover={
                            <SectionSpecifics
                                feedback={SectionSpecificsFeedback}
                            />
                        }>
                        <Button>
                            <IconForType
                                circle
                                type={modifiedType(
                                    SectionSpecificsFeedback.type
                                )}
                            />
                            {SectionSpecificsFeedback.display_name}
                        </Button>
                    </PresentationStyledItemPopover>
                </li>
            ) : null}
            {hasFeedback(SpellCheckFeedback) ? (
                <li>
                    <PresentationStyledItemPopover
                        placement="right"
                        popover={<SpellCheck feedback={SpellCheckFeedback} />}>
                        <Button>
                            <IconForType
                                circle
                                type={modifiedType(SpellCheckFeedback.type)}
                            />
                            {SpellCheckFeedback.display_name}
                        </Button>
                    </PresentationStyledItemPopover>
                </li>
            ) : null}
        </FeedbackSubSectionStyles>
    )
}
Presentation.propTypes = {
    feedback: PropTypes.object,
}

const CompetenciesItemStyled = Styled(BaseStyledPopover)`
    &.popover {
        padding: 15px;
        > .popover-content > div > div {
            font-size: 12px;
        }
    }
    h4 {
        text-transform: capitalize;
        font-size: 12px;
        font-weight: 600;
        margin: 0;
        margin-bottom: 8px;
    }
`

const Competencies = ({ feedback, displayNames }) => {
    if (!hasFeedback(feedback)) return null
    return (
        <FeedbackSubSectionStyles>
            {Object.entries(feedback)
                .filter((item) => {
                    return (
                        item[0] &&
                        displayNames[item[0]] &&
                        item[1] &&
                        item[1].feedback
                    )
                })
                .map((item) => {
                    return (
                        <li>
                            <CompetenciesItemStyled
                                placement="left"
                                popover={
                                    <div>
                                        <h4>{displayNames[item[0]]}</h4>
                                        <div>{item[1].feedback.text}</div>
                                    </div>
                                }>
                                <Button className="text-capitalize">
                                    <IconForType
                                        type={modifiedType(item[1].type)}
                                        circle
                                    />
                                    {displayNames[item[0]]}
                                </Button>
                            </CompetenciesItemStyled>
                        </li>
                    )
                })}
        </FeedbackSubSectionStyles>
    )
}
Competencies.propTypes = {
    feedback: PropTypes.object,
    displayNames: PropTypes.object,
}

const StyledResumeFeedback = Styled.div`
    ${(props) =>
        props.wait &&
        css`
            cursor: wait;
        `}
    > header {
        border-bottom: 1px solid #dadada;
        > a:first-child {
            padding: 15px 25px;
            border-right: 1px solid #dadada;
            text-decoration: none;
            display: inline-block;
            color: #2a2a2a;
            font-size: 14px;
        }
        h2 {
            margin: 0;
            font-size: 14px;
            padding: 15px;
            color: #4d4c4c;
            word-break: break-word;
        }
        .btn {
            font-size: 12px;
            color: #0075cb;
            border: none;
            outline: none !important;
        }
        .action-item {
            padding: 0 10px;
            border-left: 1px solid #eee;
            > div {
                margin-left: -15px;
                margin-right:-15px;
                padding-left: 15px;
                padding-right: 15px;
            }
            .dropdown-menu {
                margin-top: 16px;
                border-radius: 3px;
                box-shadow: 0 2px 4px 0 rgba(187, 185, 185, 0.5);
                background-color: #ffffff;
                border: solid 1px #eeeeee;
            }
        }
    }
    > main {
        > table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
            > tbody > tr > td {
                vertical-align: top;
                &:first-child {
                    border-right: 1px solid #eee;
                    width: 35%;
                    padding: 15px;
                }
                &:last-child {
                    background: #f7f7f7;
                    padding: 30px;
                    @media only screen and (max-width: 991px){
                        padding:10px 5px;
                    }
                }
            }
        }
        .overall-score {
            display: flex;
            justify-content: space-between;
            align-items: stretch;
            font-size: 14px;
            font-weight: 500;
            color: #4a4a4a;
            > span {
                /* display: flex; */
                align-items: center;
                padding: 8px 10px;
                &:last-child {
                    border-left: 1px solid #eee;
                    font-size: 16px;
                    padding-left:  25px;
                    padding-right: 25px;
                }
            }
            .get {
                font-size: 30px;
                font-weight: bold;
            }
            .from {
                font-size: 16px;
            }
        }
    }
    .good-job {
        margin: 20px 0;
        font-weight: 500;
        color: #2a2a2a;
        > main {
            border-radius: 8px;
            background-color: #f7f7f7;
            > h4 {
                padding: 15px 25px;
                margin: 0;
                font-size: 14px;
                border-bottom: 1px solid #eee;
            }
            > main {
                padding: 22px 35px;
            }
        }
    }
    .next-steps {
        margin: 20px 0 0;
        font-weight: 500;
        color: #2a2a2a;
        > main {
            border-radius: 8px;
            background-color: #f7f7f7;
            > h4 {
                padding: 15px 25px;
                margin: 0;
                font-size: 14px;
                border-bottom: 1px solid #eee;
            }
            > p {
                padding: 14px 25px 0;
                margin: 0;
                font-size: 14px;
                font-weight: 600;
            }
            > div > main {
                padding: 14px 25px 0px;
                font-size: 12px;
                font-weight: 500;
                > h4 {
                    font-size: 14px;
                    margin: 0;
                    margin-bottom: 10px;
                }
                ul {
                    list-style: none;
                    padding: 0;
                    margin: 10px 0;
                    > li {
                        padding: 0;
                        font-weight: 600;
                        + li {
                            margin-top: 15px;
                        }
                    }
                }
            }
            > footer {
                padding: 9px 25px;
                text-align: center;
                font-size: 10px;
                border-top: 1px solid #eee;
            }
        }
        > footer {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 15px;
        }
    }
    .modules-feedback {
        margin: 0;
        &__item {
            > header {
                background: white;
                max-width: 147px;
                margin: 0 auto;
                font-size: 12px;
                font-weight: 500;
                color: #4a4a4a;
                padding: 8px 15px;
                text-align: center;
                border-radius: 5px;
                border: solid 1px #eeeeee;
                @media only screen and (max-width: 991px){
                    padding: 10px 5px;
                }
                h3 {
                    margin: 0;
                }
                .get {
                    font-size: 25px;
                    font-weight: bold;
                    color: #2a2a2a;
                    line-height: 1.92;
                }
                .from {
                    &:before {
                        content: " / ";
                    }
                    font-size: 16px;
                    font-weight: normal;
                    letter-spacing: -1px;
                }
                h4 {
                    margin: 0;
                    font-size: inherit;
                    font-weight: inherit;
                }
            }
            > main {
                padding: 16px 0;
                > h2 {
                    font-size: 14px;
                    font-weight: bold;
                    color: #2a2a2a;
                    margin: 0;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    text-align: center
                }
            }
        }
    }
    .d--flex {
        display: flex;
        align-items: center;
    }
    .justify-content--between {
        justify-content: space-between;
    }
    .flex {
        flex: 1;
    }
    .edit-tag-btn {
        border: none;
        background: none;
        color: #0075cb;
        &:hover {
            background: none;
        }
    }
    .resume-info {
        padding: 11px 0px 11px 11px;
        border-right: 1px solid #f7f7f7;
        height: 100px;
        &-tags {
            padding-top: 3px;
            &-info {
                font-weight: 500;
                font-size: 14px;
                display: block;
                word-break: break-all;
                width: auto;
                float: left;
                margin: 0px 10px 5px 0px;
                padding: 1px 13px;
                color: #4d4c4c;
                background: #e8e8e8;
                border-radius: 45px;
            }
        }
    }
`

const ResumeFeedback = connect(
    (state) => {
        return {
            resumeCompetencyDisplayNames:
                state.studentList.list.resumeCompetencyDisplayNames,
        }
    },
    { showComposeEmail, fetchNextStepsResume, getResumeCompetencyDisplayNames }
)(
    class ResumeFeedback extends React.Component {
        static propTypes = {
            student: PropTypes.object.isRequired,
            resume: PropTypes.object,
            backUrl: PropTypes.string.isRequired,
            onFetchFeedback: PropTypes.func.isRequired,
            getResumeCompetencyDisplayNames: PropTypes.func.isRequired,
            resumeCompetencyDisplayNames: PropTypes.object,
            isOnlyOneResume: PropTypes.bool,
            showComposeEmail: PropTypes.func.isRequired,
            fetchNextStepsResume: PropTypes.func.isRequired,
            handleTracking: PropTypes.func,
            isCV: PropTypes.bool,
            state: PropTypes.string,
            resumeInApprovalId: PropTypes.number,
            handleTagModal: PropTypes.func,
            tags: PropTypes.array,
            resumeUploadsRemainingCount: PropTypes.number,
        }
        constructor(...args) {
            super(...args)

            this.nextSteps = []
            this.checks = []

            this.state = {
                isFetching: false,
            }
        }
        componentDidMount() {
            const { getResumeCompetencyDisplayNames } = this.props
            getResumeCompetencyDisplayNames()
            this.setState({
                isFetching: true,
            })
            this.fetch().then((r) => {
                this.setState({
                    isFetching: false,
                })
            })
        }
        componentDidUpdate(prevProps) {
            if (
                prevProps.resume &&
                prevProps.resume.id !== this.props.resume.id
            ) {
                // eslint-disable-next-line
                this.setState({
                    isFetching: true,
                })
                this.fetch().then((r) => {
                    // eslint-disable-next-line
                    this.setState({
                        isFetching: false,
                    })
                })
            }
        }
        fetch = () => {
            const {
                resume,
                onFetchFeedback,
                student,
                fetchNextStepsResume,
            } = this.props
            if (resume && student) {
                onFetchFeedback(resume.id, student)
                return fetchNextStepsResume(resume.id).then((data) => {
                    this.nextSteps = data
                        ? data.data.tracker && !_.isEmpty(data.data.tracker)
                            ? data.data.tracker
                            : []
                        : []
                    if (_.isEmpty(this.nextSteps)) {
                        this.checks = data && data.data.mandatory_checks
                    }
                    return Promise.resolve(data)
                })
            } else return Promise.reject()
        }
        bodyOfNextSteps = (nextSteps) => {
            let html =
                "<div>Hi [[name]]</div>" +
                "<div><br/></div>" +
                `<div>You are not meeting some of the key requirements to get in the green zone for your Resume. Take a look at the list below:</div>` +
                "<div><br/></div>"
            Object.keys(nextSteps).map((key) => {
                html =
                    html +
                    `<strong>${
                        key !== "bullet_level_feedback"
                            ? "Correct the"
                            : "Implement"
                    } ${
                        key === "competencies"
                            ? "Competency"
                            : key === "bullet_level_feedback"
                                ? "Bullet level feedback *"
                                : key === "presentation"
                                    ? "Presentation"
                                    : key === "impact"
                                        ? "Impact"
                                        : key
                    } ${
                        key !== "bullet_level_feedback" ? "standards *" : ""
                    }</strong><ul>`

                nextSteps[key].map((module) => {
                    html = html + `<li>${module["title"]}</li>`
                })
                html = html + `</ul>`
            })
            return html
        }
        remindForFeedback = (nextSteps) => {
            const { student, showComposeEmail } = this.props
            const body = this.bodyOfNextSteps(nextSteps)
            showComposeEmail({
                recipients: [
                    {
                        type: "students",
                        label: "Students",
                        areRecipientsEditable: false,
                        items: [student],
                    },
                ],
                template: {
                    subject: "Next Steps",
                    body: body,
                },
            })
        }
        displayResumeNameInProperFormat = (title) => {
            const len = title.length
            const maxHalfTitleLength = 10
            if (len <= 2 * maxHalfTitleLength) {
                return title
            } else {
                const modifiedTitle = title
                    .substring(0, maxHalfTitleLength)
                    .concat(
                        "...",
                        title.substring(len - maxHalfTitleLength, len)
                    )
                return modifiedTitle
            }
        }
        render() {
            const {
                resume,
                backUrl,
                student,
                isOnlyOneResume,
                handleTracking,
                isCV,
                state = "default",
                resumeInApprovalId,
                handleTagModal,
                tags,
                resumeCompetencyDisplayNames,
                resumeUploadsRemainingCount,
            } = this.props
            const { isFetching } = this.state
            if (!resume || !student) {
                return <Redirect to={backUrl} />
            }
            const {
                last_uploaded_at: uploadedAt,
                feedback,
                // network_feedback_exists: hasNetworkFeedback,
            } = resume
            const {
                [`isFetchingResumeFeedback_${resume.id}`]: isFetchingFeedback,
                [`resumeFeedback_${resume.id}`]: resumeFeedback,
                // [`resumeFeedbackErrors_${resume.id}`]: resumeFeedbackErrors,
            } = student
            const {
                feedback: { Ui = {} },
            } = resumeFeedback || { feedback: {} }
            const {
                competencies: competenciesFeedback,
                impact: impactFeedback,
                presentation: presentationFeedback,
                moduleMaxScores,
            } = Ui
            let isValid = true
            const modifiedNextSteps =
                this.nextSteps &&
                this.nextSteps.reduce((final = {}, step) => {
                    if (!final[step.module]) {
                        final[step.module] = [step]
                    } else {
                        final[step.module].push(step)
                    }
                    if (!step.title) {
                        isValid = false
                    }
                    return final
                }, {})
            const { system, total, type } = feedback
            const { competencies, impact, presentation } = system
            this.steps = presentation ? presentation.sub_checks : []
            return (
                <StyledResumeFeedback wait={isFetchingFeedback}>
                    <header className="d--flex">
                        {!isOnlyOneResume ? (
                            <Link to={backUrl}>
                                <i className="fa fa-fw fa-long-arrow-left" />
                                &nbsp;Back
                            </Link>
                        ) : null}
                        <div className="d--flex justify-content--between flex">
                            <div style={{ display: "inline-flex" }}>
                                <h2>
                                    {this.displayResumeNameInProperFormat(
                                        resume.filename
                                    )}
                                </h2>
                                <ConnectedPermission
                                    permission={
                                        PERMISSIONS["RESUME_BOOKS.ACCESS"]
                                    }
                                    render={({ hasPermssion }) =>
                                        hasPermssion ? (
                                            <ConnectedPermission
                                                permission={
                                                    PERMISSIONS[
                                                        "RESUME_APPROVAL.ACCESS"
                                                    ]
                                                }
                                                render={({ hasPermssion }) =>
                                                    hasPermssion ? (
                                                        <div
                                                            style={{
                                                                padding:
                                                                    "10px 5px",
                                                            }}>
                                                            <ResumeState
                                                                state={
                                                                    resumeInApprovalId ===
                                                                    resume.id
                                                                        ? state
                                                                        : "default"
                                                                }
                                                            />
                                                        </div>
                                                    ) : null
                                                }
                                            />
                                        ) : null
                                    }
                                />
                            </div>
                            <div
                                className="action-item"
                                style={{
                                    fontWeight: 500,
                                    display: "inline-flex",
                                }}>
                                <ConnectedPermission
                                    permission={
                                        PERMISSIONS["RESUME_BOOKS.ACCESS"]
                                    }
                                    render={({ hasPermssion }) =>
                                        hasPermssion ? (
                                            <button
                                                className="edit-tag-btn"
                                                onClick={() => {
                                                    handleTagModal(resume.id)
                                                }}>
                                                <i className="fa fa-pencil-square-o" />{" "}
                                                Edit Tags
                                            </button>
                                        ) : null
                                    }
                                />
                                <div className="resume-info-tags">
                                    {tags && tags.length > 0 ? (
                                        tags.slice(0, 3).map((tag) => (
                                            <span key={tag.id}>
                                                <span className="resume-info-tags-info">
                                                    {tag && tag.value}
                                                </span>{" "}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-muted">
                                            <i> 0 Tags Added</i>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="d--flex">
                                {isOnlyOneResume &&
                                !isNaN(resumeUploadsRemainingCount) ? (
                                    <div className="resume-upload-remaining">
                                        <img
                                            src={ResumeIcon}
                                            alt="Resume Icon"
                                        />
                                        <div className="text">
                                            Resume Upload Remaining:{" "}
                                            {resumeUploadsRemainingCount}
                                        </div>
                                    </div>
                                ) : null}
                                <div
                                    className="action-item"
                                    style={{ fontWeight: 500 }}>
                                    Uploaded on&nbsp;
                                    {moment
                                        .utc(uploadedAt)
                                        .local()
                                        .format("DD MMM YYYY")}
                                </div>
                                <ResumeProvider
                                    id={resume.id}
                                    fileName={resume.filename}
                                    render={({ onDownload, isDownloading }) => (
                                        <span className="action-item">
                                            <Button
                                                bsStyle="secondary"
                                                style={{ fontWeight: 600 }}
                                                onClick={() => {
                                                    handleTracking(
                                                        "resume_detail_view",
                                                        "download_resume"
                                                    )
                                                    onDownload()
                                                }}
                                                disabled={isDownloading}>
                                                Download{" "}
                                                {isCV ? "CV" : "Resume"}
                                            </Button>
                                        </span>
                                    )}
                                />
                                <span className="action-item">
                                    <ViewResume
                                        id={resume.id}
                                        fileName={resume.filename}
                                        render={({ onShow }) => (
                                            <Button
                                                bsStyle="secondary"
                                                style={{ fontWeight: 600 }}
                                                onClick={() => {
                                                    handleTracking(
                                                        "resume_detail_view",
                                                        "view_resume"
                                                    )
                                                    onShow()
                                                }}>
                                                View {isCV ? "CV" : "Resume"}
                                            </Button>
                                        )}
                                    />
                                </span>
                                {student.is_deactivated === "NO" ? (
                                    <span className="action-item">
                                        <NetworkFeedbackDropdown
                                            source="resume_detail_view"
                                            id={resume.id}
                                            student_id={resume.student_id}
                                        />
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </header>
                    <main>
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="overall-score">
                                            <span>Overall Score</span>
                                            <span>
                                                <span className="value">
                                                    <span
                                                        className="get"
                                                        style={{
                                                            color: getColor(
                                                                type
                                                            ),
                                                        }}>
                                                        {total}
                                                    </span>
                                                    <span className="from">
                                                        /100
                                                    </span>
                                                </span>
                                            </span>
                                            <span
                                                style={{
                                                    color: getColor(type),
                                                    fontWeight: 600,
                                                }}>
                                                {getMessage(type)}
                                            </span>
                                        </div>
                                        {type !== 2 ? (
                                            <div className="next-steps">
                                                {!isFetching ? (
                                                    Object.keys(
                                                        modifiedNextSteps
                                                    ).length && isValid ? (
                                                        <main>
                                                            <h4>
                                                                Next Steps for{" "}
                                                                {
                                                                    student.first_name
                                                                }
                                                            </h4>
                                                            <p>
                                                                {
                                                                    student.first_name
                                                                }{" "}
                                                                is not meeting
                                                                some of the key
                                                                requirements.
                                                                Take a look at
                                                                the list below:
                                                            </p>
                                                            {Object.keys(
                                                                modifiedNextSteps
                                                            ).length ? (
                                                                Object.keys(
                                                                    modifiedNextSteps
                                                                ).map(
                                                                    (
                                                                        key,
                                                                        i
                                                                    ) => {
                                                                        let newKey = (
                                                                            <h4>
                                                                                <span>
                                                                                    {key !==
                                                                                    "bullet_level_feedback"
                                                                                        ? "Correct the "
                                                                                        : "Implement "}
                                                                                </span>
                                                                                <span
                                                                                    style={{
                                                                                        textTransform:
                                                                                            "capitalize",
                                                                                    }}>
                                                                                    {key ===
                                                                                    "competencies"
                                                                                        ? "competency"
                                                                                        : key ===
                                                                                          "bullet_level_feedback"
                                                                                            ? "Bullet level feedback *"
                                                                                            : key}
                                                                                </span>
                                                                                <span>
                                                                                    {key !==
                                                                                    "bullet_level_feedback"
                                                                                        ? " standards *"
                                                                                        : null}
                                                                                </span>
                                                                            </h4>
                                                                        )
                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    i
                                                                                }>
                                                                                <main>
                                                                                    {
                                                                                        newKey
                                                                                    }
                                                                                    {modifiedNextSteps[
                                                                                        key
                                                                                    ].map(
                                                                                        (
                                                                                            module,
                                                                                            j
                                                                                        ) => {
                                                                                            return (
                                                                                                <div
                                                                                                    key={
                                                                                                        j
                                                                                                    }>
                                                                                                    <div>
                                                                                                        <ul>
                                                                                                            {module ? (
                                                                                                                <div
                                                                                                                    style={{
                                                                                                                        display:
                                                                                                                            "flex",
                                                                                                                    }}>
                                                                                                                    <i
                                                                                                                        style={{
                                                                                                                            color: getColor(
                                                                                                                                0
                                                                                                                            ),
                                                                                                                            paddingRight:
                                                                                                                                "10px",
                                                                                                                            paddingTop:
                                                                                                                                "2px",
                                                                                                                        }}
                                                                                                                        className="fa fa-times-circle-o"
                                                                                                                    />
                                                                                                                    <li>
                                                                                                                        {
                                                                                                                            module[
                                                                                                                                "title"
                                                                                                                            ]
                                                                                                                        }
                                                                                                                    </li>
                                                                                                                </div>
                                                                                                            ) : null}
                                                                                                        </ul>
                                                                                                    </div>
                                                                                                </div>
                                                                                            )
                                                                                        }
                                                                                    )}
                                                                                </main>
                                                                            </div>
                                                                        )
                                                                    }
                                                                )
                                                            ) : (
                                                                <div className="text-center">
                                                                    <i className="fa fa-spinner fa-spin" />
                                                                </div>
                                                            )}
                                                            <footer>
                                                                * These are
                                                                essential for a
                                                                {isCV
                                                                    ? " CV"
                                                                    : " resume"}{" "}
                                                                to enter the
                                                                green zone.
                                                            </footer>
                                                        </main>
                                                    ) : (
                                                        <main>
                                                            <h4>
                                                                Next Steps not
                                                                available
                                                            </h4>
                                                            <img
                                                                src={
                                                                    ZeroNextSteps
                                                                }
                                                                alt="Next steps not available"
                                                                style={{
                                                                    height:
                                                                        "150px",
                                                                    width:
                                                                        "150px",
                                                                    objectFit:
                                                                        "contain",
                                                                    margin:
                                                                        "30px 104px",
                                                                }}
                                                            />
                                                            <p
                                                                className="text-center"
                                                                style={{
                                                                    paddingBottom:
                                                                        "20px",
                                                                }}>
                                                                {
                                                                    student.first_name
                                                                }{" "}
                                                                has not
                                                                re-uploaded
                                                                resume after
                                                                migration
                                                                <sup>*</sup>
                                                            </p>
                                                            <footer>
                                                                * This is
                                                                essential for
                                                                generating next
                                                                steps.
                                                            </footer>
                                                        </main>
                                                    )
                                                ) : (
                                                    <Loader text="Fetching next steps" />
                                                )}
                                                <footer>
                                                    <Button
                                                        bsStyle="primary"
                                                        onClick={() => {
                                                            handleTracking(
                                                                "resume_detail_view",
                                                                "remind"
                                                            )
                                                            this.remindForFeedback(
                                                                modifiedNextSteps
                                                            )
                                                        }}>
                                                        Remind{" "}
                                                        {student.first_name}
                                                    </Button>
                                                    {/*TODO: Uncomment after implementing Schedule Meeting*/}
                                                    {/*<span
                                                        style={{
                                                            padding: "10px",
                                                        }}>
                                                        or
                                                    </span>*/}
                                                    {/*<Button
                                                        bsStyle="link"
                                                        style={{
                                                            fontWeight: 600,
                                                            padding: "7px 0",
                                                        }}
                                                        href="#">
                                                        Schedule Meeting
                                                    </Button>*/}
                                                </footer>
                                            </div>
                                        ) : (
                                            <div className="good-job">
                                                <main>
                                                    <h4>
                                                        Next Steps for{" "}
                                                        {student.first_name}
                                                    </h4>
                                                    <main>
                                                        <div className="text-center">
                                                            <i
                                                                style={{
                                                                    color: getColor(
                                                                        2
                                                                    ),
                                                                }}
                                                                className="fa fa-5x fa-thumbs-up"
                                                            />
                                                        </div>
                                                        <div
                                                            className="text-center"
                                                            style={{
                                                                fontSize:
                                                                    "14px",
                                                                padding: "15px",
                                                            }}>
                                                            <b>Good Job !</b>
                                                        </div>
                                                        <p className="text-center">
                                                            Great going,{" "}
                                                            {student.first_name}{" "}
                                                            is in the green
                                                            zone! This implies
                                                            that{" "}
                                                            {student.first_name}{" "}
                                                            has already done a
                                                            good job with the
                                                            resume.
                                                        </p>
                                                        <p className="text-center">
                                                            Remember, the green
                                                            zone has a range and
                                                            there could still be
                                                            room for
                                                            improvement.
                                                        </p>
                                                    </main>
                                                </main>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="row modules-feedback">
                                            <div className="col-sm-4 modules-feedback__item">
                                                <header>
                                                    <h3>
                                                        <span className="get">
                                                            {impact.score}
                                                        </span>
                                                        {moduleMaxScores ? (
                                                            <span className="from">
                                                                {
                                                                    moduleMaxScores.impact
                                                                }
                                                            </span>
                                                        ) : null}
                                                    </h3>
                                                    <h4>Impact score</h4>
                                                </header>
                                                <main>
                                                    <h2>Impact</h2>
                                                    <Impact
                                                        feedback={
                                                            impactFeedback
                                                        }
                                                    />
                                                </main>
                                            </div>
                                            <div className="col-sm-4 modules-feedback__item">
                                                <header>
                                                    <h3>
                                                        <span className="get">
                                                            {presentation.score}
                                                        </span>
                                                        {moduleMaxScores ? (
                                                            <span className="from">
                                                                {
                                                                    moduleMaxScores.presentation
                                                                }
                                                            </span>
                                                        ) : null}
                                                    </h3>
                                                    <h4>Presentation score</h4>
                                                </header>
                                                <main>
                                                    <h2>Presentation</h2>
                                                    <Presentation
                                                        feedback={
                                                            presentationFeedback
                                                        }
                                                    />
                                                </main>
                                            </div>
                                            <div className="col-sm-4 modules-feedback__item">
                                                <header>
                                                    <h3>
                                                        <span className="get">
                                                            {competencies.score}
                                                        </span>
                                                        {moduleMaxScores ? (
                                                            <span className="from">
                                                                {
                                                                    moduleMaxScores.competencies
                                                                }
                                                            </span>
                                                        ) : null}
                                                    </h3>
                                                    <h4>Competencies score</h4>
                                                </header>
                                                <main>
                                                    <h2>Competencies</h2>
                                                    <Competencies
                                                        feedback={
                                                            competenciesFeedback
                                                        }
                                                        displayNames={
                                                            resumeCompetencyDisplayNames
                                                        }
                                                    />
                                                </main>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </main>
                </StyledResumeFeedback>
            )
        }
    }
)

const FeedbackOverviewStyles = Styled.div`
    font-size: 12px;
    color: #4a4a4a;
    text-align: center;
    padding-bottom: 20px;
    .get {
        font-size: 40px;
        font-weight: bold;
        line-height: 1.2;
        color: #2a2a2a;
    }
    .from {
        font-size: 20px;
        letter-spacing: -1px;
        color: #4a4a4a;
    }
    .iterations {
        border-radius: 13px;
        background-color: #f7f7f7;
        padding: 9px;
    }
    .d--inline-block {
        display: inline-block;
    }
    .d--inline-table {
        display: inline-table;
    }
    .w--auto {
        width: auto;
    }
    .scores-table {
        td {
            padding: 5px 15px;
        }
    }
    > table > tbody > tr > td {
        &:not(:first-child) {
            padding-left: 15px;
        }

        &:not(:last-child) {
            padding-right: 15px;
            border-right: 1px solid #eee;
        }
    }
    b {
        font-weight: 500;
    }
    .btn-link {
        outline: none !important;
        padding: 0;
    }

`

const FeedbackOverview = connect(
    null,
    { showComposeEmail }
)(function FeedbackOverview({
    firstResume,
    noOfResumes,
    latestResume,
    showComposeEmail,
    student,
    pointsAwayFromCutOff,
    handleTracking,
    isCV,
}) {
    return (
        <FeedbackOverviewStyles>
            <Table className="table--no-border text-center m--0 d--inline-table">
                <tbody>
                    <tr>
                        <td className="media-middle">
                            <Table className="table--no-border m--0 w--auto d--inline-table scores-table">
                                <tbody>
                                    <tr>
                                        <td className="media-middle">
                                            <div
                                                style={{ maxWidth: "100px" }}
                                                className="d--inline-block">
                                                <span
                                                    className="get"
                                                    style={{
                                                        color: firstResume
                                                            ? firstResume.color
                                                            : "black",
                                                    }}>
                                                    {firstResume
                                                        ? firstResume.score
                                                        : ""}
                                                </span>
                                                &nbsp;
                                                <span className="from">
                                                    /100
                                                </span>
                                                <br />
                                                Initial
                                                <br />
                                                {isCV ? "CV " : "Resume "}
                                                Score
                                            </div>
                                        </td>
                                        <td className="media-middle">
                                            <div className="iterations d--inline-block">
                                                <i className="fa fa-fw fa-long-arrow-right fa-3x" />
                                                <br />
                                                After {noOfResumes - 1}{" "}
                                                iteration
                                                {noOfResumes - 1 > 1 ? "s" : ""}
                                            </div>
                                        </td>
                                        <td className="media-middle">
                                            <div
                                                style={{ maxWidth: "100px" }}
                                                className="d--inline-block">
                                                <span
                                                    className="get"
                                                    style={{
                                                        color: latestResume
                                                            ? latestResume.color
                                                            : "black",
                                                    }}>
                                                    {latestResume
                                                        ? latestResume.score
                                                        : ""}
                                                </span>
                                                &nbsp;
                                                <span className="from">
                                                    /100
                                                </span>
                                                <br />
                                                Current
                                                <br />
                                                {isCV ? "CV" : "Resume"} Score
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </td>
                        {pointsAwayFromCutOff ? (
                            <td className="media-middle">
                                <span>
                                    <span className="get">
                                        {pointsAwayFromCutOff}
                                    </span>
                                    <br />
                                    Points away
                                    <br />
                                    from Cut-Off
                                </span>
                            </td>
                        ) : null}
                        <td className="media-middle">
                            <span>
                                <span className="get">{noOfResumes}</span>
                                <br />
                                No. of {isCV ? "CVs" : "Resumes"}
                                <br />
                                uploaded
                            </span>
                        </td>
                        <td className="media-middle text-left">
                            <p style={{ paddingLeft: "10px" }}>
                                <b>
                                    {getBlfAndNfRequestMesage(
                                        student.hasBlfUsed,
                                        student.lastRequestedOn
                                    )}
                                </b>
                            </p>
                            {getBlfAndNfRequestMesage(
                                student.hasBlfUsed,
                                student.lastRequestedOn
                            ) ? (
                                <Button
                                    bsSize="sm"
                                    style={{
                                        color: "#0075cb",
                                    }}
                                    className="btn-secondary"
                                    onClick={() => {
                                        handleTracking(
                                            "resume_listing",
                                            "remind"
                                        )
                                        showComposeEmail({
                                            recipients: [
                                                {
                                                    type: "students",
                                                    label: "Students",
                                                    items: [student],
                                                    areRecipientsEditable: false,
                                                },
                                            ],
                                        })
                                    }}>
                                    Remind {student.first_name}
                                </Button>
                            ) : null}
                        </td>
                    </tr>
                </tbody>
            </Table>
        </FeedbackOverviewStyles>
    )
})

FeedbackOverview.propTypes = {
    latestResume: PropTypes.object.isRequired,
    firstResume: PropTypes.object.isRequired,
    noOfResumes: PropTypes.number.isRequired,
    student: PropTypes.object.isRequired,
    handleTracking: PropTypes.func,
    isCV: PropTypes.bool,
}

const ResumesListStlyes = Styled.div`
    background: #f7f7f7;
    color: #4d4c4c;
    font-weight: 500;
    border-top: solid 1px #e2e2e2;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    table {
        border-collapse: separate;
        table-layout: fixed;
        > thead {
            > tr > th {
                text-align: center;
                color: #2a2a2a;
                font-size: 12px;
                font-weight: 600;
                padding: 12px 20px;
                border: none;
                &:first-child {
                    border-left: 9px solid transparent;
                }
                &:last-child {
                    border-right: 9px solid transparent;
                }
                @media only screen and (max-width: 991px){
                    padding: 10px;
                }
            }
        }
        > tbody {
            border: none !important;
            > tr {
                > td {
                    font-size: 14px;
                    font-weight: 500;
                    vertical-align: middle;
                    background: white;
                    border-top: 9px solid #f7f7f7;
                    border-bottom: 9px solid #f7f7f7;
                    padding: 10px 20px;
                    @media only screen and (max-width: 991px){
                        font-size: 12px;
                        padding: 10px;
                    }
                    &.border-left {
                        position: relative;
                        &:before {
                            content: "";
                            position: absolute;
                            left: 0;
                            top: 15px;
                            bottom: 15px;
                            width: 1px;
                            background: #eeeeee;
                        }
                    }
                    &:first-child {
                        border-left: 9px solid #f7f7f7;
                        border-radius: 18px 0 0 18px;
                        font-weight: 600;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    &:last-child {
                        border-right: 9px solid #f7f7f7;
                        border-radius: 0 18px 18px 0;
                    }
                    .btn {
                        font-size: inherit;
                        font-weight: inherit;
                        color: #0075cb;
                        line-height: 1;
                        outline:none;
                        &.btn-link:hover{
                            text-decoration:underline !important;
                        }
                    }
                }

            }
        }
    }
    .get {
        font-size: 28px;
        font-weight: bold;
        @media only screen and (max-width: 991px){
            font-size: 18px;
        }
    }
    .from {
        color: #4a4a4a;
        font-size: 16px;
        font-weight: 500;
        @media only screen and (max-width: 991px){
            font-size: 14px;
        }
    }
    .text-muted {
        display: inline-flex;
    }
    .resume-list__item {
        &__uploadedOn {
            width: 15%;
            min-width: 135px;
            text-align: center;
            &Td {
                text-align: center;
                font-weight: normal;
            }
            @media only screen and (max-width: 991px){
                min-width: 110px;
            }

        }
        &__scoreTd {
            min-width: 110%;
            min-height: 108px;
            text-align: center;
            @media only screen and (max-width: 991px){
                min-width: 200px;
            }
            .unshare-icon {
                width: 30px;
            }
        }
        &__actions {
            width: 30%;
            min-width: 300px;
            text-align: center;
            @media only screen and (max-width: 991px){
                min-width: 200px;
            }
        }
    }
    .fake-thead {
        th {
            height: 0 !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            opacity: 0 !important;
        }
    }
    .table-wrapper-container {
        padding: 10px;
        &:not(:first-child) {
            border-top: 1px solid #ddd;
        }
        > table > thead > tr > th{
            text-align: center;
        }
    }
    .edit-tag-btn {
        border: none;
        background: none;
        color: #0075cb;
        &:hover {
            background: none;
        }
    }
    .resume-info {
        padding: 11px 0px 11px 11px;
        border-right: 1px solid #f7f7f7;
        height: 100px;
        &-tags {
            margin-top: 10px;
            &-info {
                font-weight: 500;
                font-size: 14px;
                display: block;
                word-break: break-all;
                width: auto;
                float: left;
                margin: 0px 10px 5px 0px;
                padding: 1px 13px;
                color: #4d4c4c;
                background: #e8e8e8;
                border-radius: 45px;
            }
        }
    }
`

class ResumesList extends React.Component {
    static propTypes = {
        resumes: PropTypes.array.isRequired,
        resumesById: PropTypes.object.isRequired,
        url: PropTypes.string.isRequired,
        handleTracking: PropTypes.func,
        isCV: PropTypes.bool,
        state: PropTypes.string,
        resumeInApprovalId: PropTypes.number,
        handleTagModal: PropTypes.func,
        tagsList: PropTypes.array,
    }
    constructor(...args) {
        super(...args)
        this.state = {
            showTags: false,
        }
    }
    toggleTags = () => {
        this.setState({
            showTags: true,
        })
    }
    onHide = () => {
        this.setState({
            showTags: false,
        })
    }
    render() {
        const {
            resumes,
            resumesById,
            url,
            handleTracking,
            isCV,
            state = "default",
            resumeInApprovalId,
            handleTagModal,
            tagsList,
        } = this.props
        const { showTags } = this.state
        return (
            <ResumesListStlyes>
                <div className="table-wrapper-container">
                    <Table className="table--no-border m--0" cellSpacing={0}>
                        <thead>
                            <tr>
                                <th className="resume-list__item__title">
                                    {isCV ? "CV" : "Resume"} Title
                                </th>
                                <th className="resume-list__item__tags">
                                    Tags
                                </th>
                                <th className="resume-list__item__uploadedOn">
                                    Uploaded On
                                </th>
                                <th
                                    colSpan={2}
                                    className="resume-list__item__score">
                                    Overall Score
                                </th>
                                <th
                                    colSpan={2}
                                    className="resume-list__item__actions">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                    </Table>
                </div>
                <div className="table-wrapper-container">
                    <Table className="table--no-border m--0" cellSpacing={0}>
                        <thead className="fake-thead">
                            <tr>
                                <th className="resume-list__item__title" />
                                <th className="resume-list__item__tags" />
                                <th className="resume-list__item__uploadedOn" />
                                <th
                                    colSpan={2}
                                    className="resume-list__item__score"
                                />
                                <th
                                    colSpan={2}
                                    className="resume-list__item__actions"
                                />
                            </tr>
                        </thead>
                        {resumes.map((id) => {
                            const resume = resumesById[id]
                            return (
                                <tbody key={id}>
                                    <tr>
                                        <td className="resume-list__item__titleTd">
                                            <OverlayTrigger
                                                placement="bottom"
                                                overlay={
                                                    <Tooltip
                                                        id={`tooltip-name`}>
                                                        {resume.filename}
                                                    </Tooltip>
                                                }>
                                                <div>{resume.filename}</div>
                                            </OverlayTrigger>
                                        </td>
                                        <td className="resume-list__item__tagsTd text-center border-left">
                                            <div>
                                                <ConnectedPermission
                                                    permission={
                                                        PERMISSIONS[
                                                            "RESUME_BOOKS.ACCESS"
                                                        ]
                                                    }
                                                    render={({
                                                        hasPermssion,
                                                    }) =>
                                                        hasPermssion ? (
                                                            <button
                                                                className="edit-tag-btn pull-left"
                                                                onClick={() => {
                                                                    handleTagModal(
                                                                        resume.id
                                                                    )
                                                                }}>
                                                                <i className="fa fa-pencil-square-o" />{" "}
                                                            </button>
                                                        ) : null
                                                    }
                                                />

                                                <div className="resume-info-tags">
                                                    {tagsList[resume.id] &&
                                                    tagsList[resume.id].length >
                                                        0 ? (
                                                        tagsList[resume.id]
                                                            .slice(0, 3)
                                                            .map((tag) => (
                                                                <span
                                                                    // style={{ margin: "0px 6px 4px 0px" }}
                                                                    key={
                                                                        tag.id
                                                                    }>
                                                                    <span className="resume-info-tags-info">
                                                                        {
                                                                            tag.value
                                                                        }
                                                                    </span>{" "}
                                                                </span>
                                                            ))
                                                    ) : (
                                                        <span className="text-muted">
                                                            <i> 0 Tags Added</i>
                                                        </span>
                                                    )}
                                                    {tagsList[resume.id] &&
                                                    tagsList[resume.id].length >
                                                        3 ? (
                                                        <span
                                                            ref="tagPopover"
                                                            onClick={
                                                                this.toggleTags
                                                            }
                                                            style={{
                                                                float: "left",
                                                                marginLeft:
                                                                    "-8px",
                                                                marginTop:
                                                                    "2px",
                                                                positive:
                                                                    "relative",
                                                            }}
                                                            className="cont-names">
                                                            {"+"}
                                                            {tagsList[resume.id]
                                                                .length - 3}
                                                            <Overlay
                                                                show={showTags}
                                                                placement="right"
                                                                rootClose
                                                                container={this}
                                                                onHide={
                                                                    this.onHide
                                                                }
                                                                target={() =>
                                                                    ReactDOM.findDOMNode(
                                                                        this
                                                                            .refs
                                                                            .tagPopover
                                                                    )
                                                                }>
                                                                <Popover id="popover-basic">
                                                                    {tagsList[
                                                                        resume
                                                                            .id
                                                                    ] &&
                                                                    tagsList[
                                                                        resume
                                                                            .id
                                                                    ].length > 0
                                                                        ? tagsList[
                                                                              resume
                                                                                  .id
                                                                          ]
                                                                              .slice(
                                                                                  3,
                                                                                  tagsList[
                                                                                      resume
                                                                                          .id
                                                                                  ]
                                                                                      .length
                                                                              )
                                                                              .map(
                                                                                  (
                                                                                      tag
                                                                                  ) => (
                                                                                      <div
                                                                                          key={
                                                                                              tag.id
                                                                                          }>
                                                                                          <div className="resume-info-tags-info">
                                                                                              {
                                                                                                  tag.value
                                                                                              }
                                                                                          </div>{" "}
                                                                                      </div>
                                                                                  )
                                                                              )
                                                                        : null}
                                                                </Popover>
                                                            </Overlay>
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="resume-list__item__uploadedOnTd text-center border-left">
                                            <div>
                                                {moment
                                                    .utc(
                                                        resume.last_uploaded_at
                                                    )
                                                    .local()
                                                    .format("DD MMM YYYY")}
                                            </div>
                                        </td>
                                        <td className="resume-list__item__scoreTd text-center border-left">
                                            <div>
                                                <span
                                                    className="get"
                                                    style={{
                                                        color: getColor(
                                                            resume.feedback.type
                                                        ),
                                                    }}>
                                                    {resume.feedback.total}
                                                </span>
                                                &nbsp;
                                                <span className="from">
                                                    /100
                                                </span>
                                            </div>
                                            <ConnectedPermission
                                                permission={
                                                    PERMISSIONS[
                                                        "RESUME_BOOKS.ACCESS"
                                                    ]
                                                }
                                                render={({ hasPermssion }) =>
                                                    hasPermssion ? (
                                                        <ConnectedPermission
                                                            permission={
                                                                PERMISSIONS[
                                                                    "RESUME_APPROVAL.ACCESS"
                                                                ]
                                                            }
                                                            render={({
                                                                hasPermssion,
                                                            }) =>
                                                                hasPermssion ? (
                                                                    <div
                                                                        style={{
                                                                            padding:
                                                                                "5px 40px",
                                                                        }}>
                                                                        <ResumeState
                                                                            state={
                                                                                resumeInApprovalId ===
                                                                                id
                                                                                    ? state
                                                                                    : "default"
                                                                            }
                                                                        />
                                                                    </div>
                                                                ) : null
                                                            }
                                                        />
                                                    ) : null
                                                }
                                            />
                                        </td>
                                        <td
                                            className="text-center border-left"
                                            style={{
                                                color: getColor(
                                                    resume.feedback.type
                                                ),
                                            }}>
                                            <div>
                                                {getMessage(
                                                    resume.feedback.type
                                                )}
                                            </div>
                                        </td>
                                        <td className="resume-list__item__actionsTd text-center border-left">
                                            <div>
                                                <ViewResume
                                                    id={resume.id}
                                                    fileName={resume.filename}
                                                    render={({ onShow }) => (
                                                        <Button
                                                            bsStyle="secondary"
                                                            onClick={() => {
                                                                handleTracking(
                                                                    "resume_listing",
                                                                    "view_resume"
                                                                )
                                                                onShow()
                                                            }}>
                                                            View{" "}
                                                            {isCV
                                                                ? "CV"
                                                                : "Resume"}
                                                        </Button>
                                                    )}
                                                />
                                            </div>
                                        </td>
                                        <td className="text-center border-left">
                                            <div>
                                                <NavLink
                                                    key={resume.id}
                                                    bsStyle="secondary"
                                                    onClick={() =>
                                                        handleTracking(
                                                            "resume_listing",
                                                            "show_details"
                                                        )
                                                    }
                                                    component={Button}
                                                    to={`${url}/${resume.id}`}>
                                                    Show Details
                                                </NavLink>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            )
                        })}
                    </Table>
                </div>
            </ResumesListStlyes>
        )
    }
}

const DownloadResumes = ({ resumes, resumesById, isCV }) => (
    <Table hover>
        <thead>
            <tr>
                <th>Resume Title</th>
                <th>Uploaded on</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {resumes.map((id) => {
                const resume = resumesById[id]
                return (
                    <tr key={resume.id}>
                        <td>{resume.filename}</td>
                        <td>
                            {moment(resume.last_uploaded_at).format(
                                "DD MMM YYYY"
                            )}
                        </td>
                        <td>
                            <ResumeProvider
                                id={resume.id}
                                fileName={`${resume.filename}`}
                                render={({ onDownload, isDownloading }) => (
                                    <Button
                                        className="btn btn-link btn-sm"
                                        onClick={onDownload}
                                        disabled={isDownloading}>
                                        <i
                                            className={`fa fa-${
                                                isDownloading
                                                    ? "spin fa-spinner"
                                                    : "download"
                                            } fa-fw`}
                                        />
                                    </Button>
                                )}
                            />
                        </td>
                    </tr>
                )
            })}
        </tbody>
    </Table>
)
DownloadResumes.propTypes = {
    resumes: PropTypes.array.isRequired,
    resumesById: PropTypes.object.isRequired,
    isCV: PropTypes.bool,
}

export class ResumeProduct extends React.Component {
    static propTypes = {
        student: PropTypes.object.isRequired,
        profilePic: PropTypes.string,
        onFetch: PropTypes.func.isRequired,
        match: PropTypes.object.isRequired,
        onFetchResumeFeedback: PropTypes.func.isRequired,
        trackEvents: PropTypes.func,
        isCV: PropTypes.bool,
        productConfig: PropTypes.object,
        showQuotaModal: PropTypes.func,
        reviewRequest: PropTypes.func,
        fetchResumeTags: PropTypes.func,
        updateResumeTags: PropTypes.func,
        fetchBulkResumeTags: PropTypes.func,
        fetchSingleResumeTags: PropTypes.func,
        fetchResumeUploadsRemainingCount: PropTypes.func,
    }
    static defaultProps = {
        productConfig: {},
    }
    constructor(...args) {
        super(...args)
        this.state = {
            showDownloadResumes: false,
            resumeInApproval: {},
            isShowEditTagsModal: false,
            editTagId: null,
            isFetchingTags: false,
            tags: [],
            tagsList: [],
            resumeUploadsRemainingCount: null,
        }
    }
    componentDidMount() {
        const {
            student,
            onFetch,
            reviewRequest,
            fetchResumeUploadsRemainingCount,
        } = this.props
        if (student.latestResumeScore !== undefined) {
            onFetch(student)
            reviewRequest(student.signup_id).then(({ items }) => {
                this.setState({
                    resumeInApproval: items.length ? items[0] : {},
                })
            })
        }
        fetchResumeUploadsRemainingCount(student.signup_id).then(({ data }) => {
            this.setState({
                resumeUploadsRemainingCount: data["resume_uploads_remaining"],
            })
        })
    }

    componentWillMount() {
        const {
            fetchResumeTags,
            fetchSingleResumeTags,
            fetchBulkResumeTags,
        } = this.props
        this.setState({
            isFetchingTags: true,
        })
        const tagsOptions = [
            {
                label: "UK Format",
                value: "uk format",
            },
            {
                label: "UKormat",
                value: "ukormat",
            },
            {
                label: "UKor",
                value: "ukor",
            },
        ]
        const tags = [
            /* {
                label: "UK Format",
                value: "uk format",
            },
            {
                label: "UKormat",
                value: "ukormat",
            }, */
        ]
        this.setState({
            isFetchingTags: false,
            tagsOptions: tagsOptions,
            tags: tags,
        })
        /* fetchResumeTags().then((data) => {
            let tagsOptions = []
            data.map((tag) => {
                tagsOptions.push({
                    value: tag.name,
                    label: tag.name,
                })
            })
            this.setState({
                isFetchingTags: false,
                tagsOptions: tagsOptions,
            })
        })
        fetchSingleResumeTags(editTagId).then((data) => {
            let tags = []
            data.map((tag) => {
                tags.push({
                    value: tag.name,
                    label: tag.name,
                })
            })
            this.setState({
                isFetchingTags: false,
                tags: tags,
            })
        }) */
        /* fetchBulkResumeTags(editTagId).then((data) => {
            let tagsList = []
            data.map((tag) => {
                tagsList.push({
                    value: tag.name,
                    label: tag.name,
                })
            })
            this.setState({
                isFetchingTags: false,
                tagsList: tagsList,
            })
        }) */
    }

    toggleShowDownloadResumes = () => {
        this.setState(({ showDownloadResumes }) => ({
            showDownloadResumes: !showDownloadResumes,
        }))
    }
    handleTracking = (category, label) => {
        const { trackEvents } = this.props
        trackEvents({
            track_type: "event",
            event_category: category,
            event_action: "click",
            event_label: label,
        })
    }

    handleTagModal = (id) => {
        this.setState({
            isShowEditTagsModal: !this.state.isShowEditTagsModal,
            editTagId: id,
        })
    }
    render() {
        const {
            student,
            match,
            onFetchResumeFeedback,
            profilePic,
            isCV,
            productConfig,
            showQuotaModal,
            updateResumeTags,
        } = this.props
        const {
            showDownloadResumes,
            resumeInApproval,
            editTagId,
            tagsOptions,
            isFetchingTags,
            tags,
            tagsList,
            resumeUploadsRemainingCount,
        } = this.state
        const {
            isFetchingResumeProductDetails: isFetching,
            resumeProductDetails: data,
            latestResumeScore,
            // resumeProductDetailsErrors: errors,
            signup_id: signupId,
        } = student
        const {
            resumes = [],
            resumesById,
            // score_improvement: scoreImprovement,
            latest_resume_score: latestResumeScoreFromFeedback,
            first_resume_score: firstResumeScore,
            first_resume_score_type: firstResumeScoreType,
            latest_resume_score_type: latestResumeScoreType,
            away_from_cutoff_score: pointsAwayFromCutOff,
        } =
            data || {}
        resumes.sort(function(a, b) {
            const sort = moment(resumesById[a].last_uploaded_at).isBefore(
                resumesById[b].last_uploaded_at
            )
                ? 1
                : -1
            return sort
        })
        const firstResume = {
            score: firstResumeScore,
            color: getColor(firstResumeScoreType),
        }
        const latestResume = {
            score: latestResumeScoreFromFeedback,
            color: getColor(latestResumeScoreType),
        }
        const { path, url } = match

        if (isFetching && !data) {
            return <ProductLoading />
        }
        if (latestResumeScore === undefined || resumes.length === 0) {
            return (
                <NoProductData
                    noDataImg={isCV ? ZeroCV : ZeroResume}
                    student={student}
                    label=""
                    reminderLabel={
                        productConfig["resume"] === false
                            ? null
                            : "Send Reminder"
                    }
                />
            )
        }
        if (!data) {
            return null
        }
        const { status: state, resume_id } = resumeInApproval
        const studentInfo = {
            name: student.name,
            email: student.email,
            profilePicUrl: student.profile_pic || profilePic,
        }
        const filename =
            resumesById[editTagId] && resumesById[editTagId].filename
        return (
            <div className="card">
                <ConnectedPermission
                    permission={PERMISSIONS["RESUME_BOOKS.ACCESS"]}
                    render={({ hasPermssion }) =>
                        hasPermssion ? (
                            <EditTagsModal
                                id={editTagId}
                                tags={tags}
                                isFetchingTags={isFetchingTags}
                                tagsOptions={tagsOptions}
                                updateResumeTags={updateResumeTags}
                                isShowEditTagsModal={
                                    this.state.isShowEditTagsModal
                                }
                                hideEditTagsModal={this.handleTagModal}
                                resume={filename}
                            />
                        ) : null
                    }
                />
                <Switch>
                    <Route
                        path={`${path}/:resumeId`}
                        resume
                        render={({
                            match: {
                                params: { resumeId },
                            },
                        }) => (
                            <ResumeFeedback
                                backUrl={url}
                                isOnlyOneResume={resumes.length <= 1}
                                onFetchFeedback={onFetchResumeFeedback}
                                resume={resumesById[resumeId]}
                                resumeUploadsRemainingCount={
                                    resumeUploadsRemainingCount
                                }
                                student={student}
                                handleTracking={this.handleTracking}
                                isCV={isCV}
                                state={state}
                                resumeInApprovalId={resume_id ? resume_id : 0}
                                handleTagModal={this.handleTagModal}
                                tags={tags}
                            />
                        )}
                    />
                    {resumes.length === 1 ? (
                        <Redirect to={`${url}/${resumes[0]}`} />
                    ) : null}
                    <Route
                        path={path}
                        render={() => (
                            <div>
                                <div
                                    className="text-right resume-count-section"
                                    style={{ padding: "15px" }}>
                                    <div className="resume-upload-remaining resume-multiple">
                                        <img
                                            src={ResumeIcon}
                                            alt="Resume Icon"
                                        />
                                        Resume Upload Remaining:{" "}
                                        {resumeUploadsRemainingCount}
                                    </div>
                                    <ConnectedPermission
                                        permission={
                                            PERMISSIONS[
                                                "SUPPORT.RP.ADDITIONAL_UPLOADS.ACCESS"
                                            ]
                                        }
                                        render={({ hasPermssion }) =>
                                            hasPermssion ? (
                                                <Button
                                                    bsStyle="bordered"
                                                    bsSize="sm"
                                                    onClick={() =>
                                                        showQuotaModal(
                                                            studentInfo,
                                                            signupId
                                                        )
                                                    }
                                                    style={{
                                                        marginRight: "10px",
                                                    }}>
                                                    Add Uploads
                                                </Button>
                                            ) : null
                                        }
                                    />
                                    <Button
                                        bsStyle="bordered"
                                        bsSize="sm"
                                        onClick={() => {
                                            this.handleTracking(
                                                "resume_listing",
                                                "download_resume"
                                            )
                                            this.toggleShowDownloadResumes()
                                        }}>
                                        Download {isCV ? "CVs" : "Resumes"}
                                    </Button>
                                </div>
                                <FeedbackOverview
                                    noOfResumes={resumes.length}
                                    student={student}
                                    firstResume={firstResume}
                                    latestResume={latestResume}
                                    pointsAwayFromCutOff={pointsAwayFromCutOff}
                                    handleTracking={this.handleTracking}
                                    isCV={isCV}
                                />
                                <ResumesList
                                    isCV={isCV}
                                    resumes={resumes}
                                    resumesById={resumesById}
                                    url={url}
                                    handleTracking={this.handleTracking}
                                    state={state}
                                    resumeInApprovalId={
                                        resume_id ? resume_id : 0
                                    }
                                    handleTagModal={this.handleTagModal}
                                    tagsList={tagsList}
                                />
                            </div>
                        )}
                    />
                </Switch>
                <Modal
                    show={showDownloadResumes}
                    onHide={this.toggleShowDownloadResumes}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Download {isCV ? "CV" : "Resume"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body
                        style={{
                            maxHeight: "400px",
                            overflow: "auto",
                        }}>
                        <DownloadResumes
                            resumes={resumes}
                            resumesById={resumesById}
                            isCV={isCV}
                        />
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}

export default IsCvProvider(
    connect(
        null,
        {
            onFetch: getResumeProductDetails,
            onFetchResumeFeedback: getResumeFeedback,
            trackEvents,
            reviewRequest,
            fetchResumeTags,
            updateResumeTags,
            fetchBulkResumeTags,
            fetchSingleResumeTags,
            fetchResumeUploadsRemainingCount,
        }
    )(ResumeProduct)
)
