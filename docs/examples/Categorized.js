// @flow
import React from 'react';

import { colors } from '../../packages/react-select/src/theme';

import { groupedOptions } from '../data';

import { Li, Ul } from '../styled-components';

import Select from '../../packages/react-select/src';

const Group = (props) => {
  const { children, getStyles, Heading, innerProps, label } = props;
  return (
    <Li
      aria-label={label}
      css={getStyles('group', props)}
      {...innerProps}
    >
      <Heading {...props} />
      <Ul>{children}</Ul>
    </Li>
  );
};

const getGroupHeadingStyles = ({ isSelected, isDisabled }) => {
  return defaultStyles => {
    return ({
      ...defaultStyles,
      backgroundColor: isSelected ? colors.primary : 'transparent',
      color: isDisabled ? colors.neutral20 : isSelected ? colors.neutral0 : 'inherit',
      ':hover': isDisabled ? null : { background: '#999', color: '#fff' },
    });
  };
};

const GroupHeading = (props) => {
  const { getStyles, label, isDisabled } = props;

  const children = () => {
    // console.log(props);
    const { group: { key }, menuOptions: { render } } = props;
    const selectedGroup = render.find(i => i.key == key);
    // console.log(selectedGroup);
    return selectedGroup ? selectedGroup.options : [];
  };

  const allOptionsSelected = () => {
    const selectValue = props.getValue();
    return children().map(i => props.isOptionSelected(i, selectValue)).every(isTrue => isTrue);
  };

  const valuesIncludingChildren = () => {
    const { isOptionSelected } = props;
    const selectValue = props.getValue();
    return [
      ...children().filter(i => !isOptionSelected(i, selectValue)).map(i => i.data),
      ...selectValue,
    ];
  };

  const valuesExcludingChildren = () => {
    const { isOptionSelected } = props;
    const selectValue = props.getValue();
    return selectValue.filter(i => !isOptionSelected(i, children())).map(i => i.data);
  };

  const toggleGroup = () => {
    const { setValue } = props;
    if (allOptionsSelected()) setValue(valuesExcludingChildren());
    else setValue(valuesIncludingChildren());
  };

  const isSelected = allOptionsSelected();

  const defaultStyles = getStyles('groupHeading', props);
  const styles = getGroupHeadingStyles({ isSelected, isDisabled })(defaultStyles);

  return (
    <span onClick={isDisabled ? null : toggleGroup} style={styles}>
      <input readOnly type="checkbox" checked={isSelected}/>
      {label}
    </span>
  );

};

const getOptionStyles = defaultStyles => ({
  ...defaultStyles,
  paddingLeft: '2em',
});

const Option = props => {
  const { children, getStyles, isSelected, innerProps } = props;

  const defaultStyles = getStyles('option', props);
  const styles = getOptionStyles(defaultStyles);
  return (
    <span {...innerProps} style={styles}>
      <input type="checkbox" checked={isSelected} readOnly/>
      {children}
    </span>
  );
};

export default (props) => {
  return (
    <Select
      {...props}
      closeMenuOnSelect={false}
      components={{ Group, GroupHeading, Option }}
      hideSelectedOptions={false}
      isMulti
      menuIsOpen
      options={groupedOptions}
    />
  );
};
