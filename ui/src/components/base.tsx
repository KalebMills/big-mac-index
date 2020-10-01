import { InputHTMLAttributes } from 'react';
import React from 'react';
import { Input as RInput, InputProps } from 'reactstrap';


export const Input = (props: InputProps): JSX.Element => {
    return <RInput {...props} />;
}