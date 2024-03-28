import React from 'react'

export default function DialogView({dialogOpen, smaller, children}) {
    if (!dialogOpen) return null
    return <div className="dialog">
        <div className="dialog-backdrop"/>
        <div className="dialog-content container">
            <div className="row row-center v-center-block">
                <div className={`column column-${smaller ? '50' : '80'}`}>
                    <div className="segment blank">
                        <div className="dialog-body">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}