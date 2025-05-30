import cn from 'pkgs/classnames'
import React, { useState } from 'react'
import { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form'

import './Dropdown.scss'

export interface DropdownProps<T extends FieldValues> {
    className?: string
    title: string
    options: {
        title: string
        onChoice: () => void
    }[]
    id?: Path<T>
    register?: UseFormRegister<T>
    errors?: FieldErrors<T>
}

export default function Dropdown<T extends FieldValues>(props: DropdownProps<T>): ReactNode {
    const b = 'Dropdown'

    const { className, title, id, options, register, errors } = props

    let registerProps = id && register ? { ...register(id) } : {}

    const [isOpened, setOpened] = useState(false)

    const dropdownButtonRef = useRef<HTMLButtonElement>(null)
    const dropdownOptionsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function onClick(ev: MouseEvent | TouchEvent): void {
            let optionClick = false
            dropdownOptionsRef.current?.querySelectorAll(`.${b}-option-button`).forEach(option => {
                if (ev.target === option) {
                    optionClick = true
                }
            })

            if (
                !(ev.target as HTMLElement).contains(dropdownButtonRef.current) &&
                !(ev.target as HTMLElement).contains(dropdownOptionsRef.current) &&
                !optionClick
            ) {
                setOpened(false)
            }
        }

        window.addEventListener('mouseup', onClick)
        window.addEventListener('touchend', onClick)

        return (): void => {
            window.removeEventListener('mouseup', onClick)
            window.removeEventListener('touchend', onClick)
        }
    }, [])

    function onClickOptionButton(option: (typeof options)[0]): void {
        option.onChoice()
        setOpened(false)
    }

    return (
        <div className={cn('FormControl', b, className)}>
            <button
                ref={dropdownButtonRef}
                className={`Button ${b}-dropdown-button`}
                onClick={() => setOpened(isOpened => !isOpened)}
            >
                {title}
            </button>

            {isOpened && (
                <div
                    ref={dropdownOptionsRef}
                    className={`${b}-dropdown`}
                    {...registerProps}
                    id={id}
                >
                    {options.map((option, i) => (
                        <div
                            className={`Button ${b}-option-button`}
                            key={i}
                            onClick={() => onClickOptionButton(option)}
                        >
                            {option.title}
                        </div>
                    ))}
                </div>
            )}

            {id && errors && errors[id] && (
                <span role="alert" className={`ErrorMessage ${b}-errors`}>
                    {errors[id] && (errors[id].message as string)}
                </span>
            )}
        </div>
    )
}
