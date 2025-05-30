import cn from 'pkgs/classnames'
import React from 'react'
import { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form'

import './Select.scss'

export interface SelectProps<T extends FieldValues> {
    id: Path<T>
    options: {
        title: string
        value: string
    }[]
    register: UseFormRegister<T>
    errors: FieldErrors<T>
    label?: string
}

export default function Select<T extends FieldValues>(props: SelectProps<T>): ReactNode {
    const b = 'Select'

    const { id, options, register, errors, label } = props

    return (
        <div className={cn('FormControl', b)}>
            {label && (
                <label htmlFor={id} className={`${b}-label`}>
                    {label}
                </label>
            )}

            <select className={`${b}-select`} {...register(id)} id={id}>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.title}
                    </option>
                ))}
            </select>

            {errors[id] && (
                <span role="alert" className={`ErrorMessage ${b}-errors`}>
                    {errors[id] && (errors[id].message as string)}
                </span>
            )}
        </div>
    )
}
