import React from 'react';

import { flavourOptions } from '../data';
import Select from '../../packages/react-select';

export default () => (
  <Select
    defaultValue={flavourOptions[2]}
    label="Single select"
    options={flavourOptions}
    theme={theme => ({
      ...theme,
      borderRadius: 0,
      colors: {
        ...theme.colors,
        primary25: 'hotpink',
        primary: 'black',
      },
    })}
  />
);
