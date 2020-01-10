// @flow
import React from 'react';

import every from 'lodash/every';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import map from 'lodash/map';
import forEach from 'lodash/forEach';
import isArray from 'lodash/isArray';
import groupBy from 'lodash/groupBy';
import countBy from 'lodash/countBy';
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import pullAt from 'lodash/pullAt';

import { groupedOptions } from '../data';

import Select from '../../packages/react-select/src';
import { components } from '../../packages/react-select';

const getOptionStyles = defaultStyles => {
    return {
      ...defaultStyles,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '1.2em'
    };
  },

  getGroupHeadingStyles = ({ isSelected, isDisabled, isHovered }) => {
    return defaultStyles => {
      return {
        ...defaultStyles,
        backgroundColor: isSelected || (!isDisabled && isHovered) ? '#999999' : 'transparent',
        color: isSelected || (!isDisabled && isHovered) ? '#ffffff' : defaultStyles.color,
        display: 'flex',
        alignItems: 'center',
        paddingTop: '5px',
        paddingBottom: '5px'
      };
    };
  },

  getGroup = (value, list) => {

    let found = find(list, ['value', value]);

    if (!(found && found.value) && isArray(list)) {
      forEach(list, subList => {
        if (subList.options && getGroup(value, subList.options)) {
          found = subList;
          return false;
        }
      });
    }

    return found;
  };


export const ValueContainer = (props) => {

  const children = props.children[0];

  let toBeRendered = [children, props.children[1]];

  if (props.isMulti) {
    const optionList = props.getValue(),
      optionsGroupedBy = groupBy(optionList, 'group'),
      optionValueList = [];

    map(optionsGroupedBy, (group, key) => {
      if (key === 'undefined') {
        return map(group, option => optionValueList.push(option.value));
      } else {
        // Group Already appended don't add children
        const groupFound = getGroup(key, props.options);
        if (groupFound.options.length > group.length) return map(group, option => optionValueList.push(option.value));
      }
    });

    toBeRendered = [
      !isArray(children) && children.key && children.key === 'placeholder'
        ? children
        : [filter(children, child => child && includes(optionValueList, child.key))],
      props.children[1]
    ];
  }

  return (<components.ValueContainer {...props}>{toBeRendered}</components.ValueContainer>);
};

const Option = props => {

  const toggleOption = () => {

    const optionList = props.getValue();

    if (props.isMulti) {
      const group = getGroup(props.value, props.options),
        groupOptionCount = countBy(optionList, ['group', group.value]).true;

      const removeIndexArr = [findIndex(optionList, ['value', props.data.value])];

      if (removeIndexArr[0] !== -1) {
        const groupIndex = findIndex(optionList, ['value', group.value]);
        if (groupIndex !== -1) removeIndexArr.push(groupIndex);
        pullAt(optionList, removeIndexArr);
      } else {
        optionList.push({ ...props.data, group: group.value });

        // +1 for option currently selected
        if ((groupOptionCount + 1) === group.options.length) {
          const { options, ...groupData } = group;
          optionList.push(groupData);
        }
      }
    }
    // For Single Mode always first index is pushed
    else {
      optionList[0] = props.data;
    }

    props.setValue(optionList);
  };

  return (
    <span
      {...props.innerProps}
      style={getOptionStyles(props.getStyles('option', props))}
      onClick={toggleOption}
    >
      {
        props.isMulti && (
          <input
            type='checkbox'
            readOnly={true}
            checked={props.isSelected}
            onChange={() => null}
            style={{ margin: '0 2px 0 0' }}
          />
        )
      }
      {' '}
      {props.label}
    </span>
  );
};

const GroupHeading = (props) => {

  const [isHovered, setIsHovered] = useState(false);

  const getChildrenList = () => {
    const selectedGroup = find(props.menuOptions.render, i => i.key === props.group.key);
    return selectedGroup && selectedGroup.options ? selectedGroup.options : [];
  };

  const allOptionsSelected = () => {
    const selectValue = props.getValue();
    return every(getChildrenList(), i => props.isOptionSelected(i, selectValue));
  };

  const includedOptions = (groupData) => {
    const selectValue = props.getValue();
    return [
      groupData,
      ...map(getChildrenList(), i => {
        if (!props.isOptionSelected(i, selectValue)) return { ...i.data, group: props.group.data.value };
      }),
      ...selectValue,
    ];
  };

  const excludedOptions = () => {
    const children = getChildrenList(),
      selectValue = props.getValue();

    return map(selectValue, i => {
      if (!props.isOptionSelected(i, children)) return selectValue;
    });
  };

  const toggleGroup = () => {
    const { options, ...groupData } = props.group.data;

    if (props.isMulti) {
      if (!allOptionsSelected()) {
        props.setValue(includedOptions(groupData));
      } else {
        props.setValue(excludedOptions());
      }
    } else {
      props.setValue([groupData]);
    }
  };

  let styles = getGroupHeadingStyles({
    isSelected: allOptionsSelected(),
    isDisabled: props.isDisabled,
    isHovered
  })(props.getStyles('groupHeading', props));

  return (
    <span
      className='group-heading'
      onClick={props.isDisabled ? null : toggleGroup}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={styles}
    >
      {
        props.isMulti && (
          <input
            type='checkbox'
            readOnly={true}
            checked={allOptionsSelected()}
            style={{ margin: '0 2px 0 0' }}
            onChange={() => null}
          />
        )
      }
      {' '}
      {props.label}
    </span>
  );

};

const Group = (props) => {
  return (
    <li
      aria-label={props.label}
      style={{ ...props.getStyles('group', props), listStyle: 'none' }}
      ref={props.innerRef}
      {...props.innerProps}
    >
      <props.Heading {...props} />
      <ul
        ref={props.innerRef}
        style={{ margin: 0, padding: 0 }}
      >
        {props.children}
      </ul>
    </li>
  );
};


export default (props) => {
  return (
    <Select
      {...props}
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      options={groupedOptions}
      isMulti
      components={{ Group, GroupHeading, Option }}
    />
  );
};
