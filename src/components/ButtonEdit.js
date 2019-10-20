import React from 'react';

import {Button, Dimmer, Dropdown, Form, Input, Loader, Modal, Segment} from 'semantic-ui-react'
import axios from "axios";
import {HOST_API} from "../constants/config";
import {toast} from "react-toastify";


export default class ButtonEdit extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            btnOptions: [
                {key: '1', value: 'new', text: 'New', icon: 'add circle'},
                {key: '2', value: '1', text: 'Главное меню',},
                {key: '3', value: '22', text: 'Товар'}
            ],
            userTables: [
                {key: '2', value: '1', text: 'Покупки',},
                {key: '3', value: '22', text: 'Товар'}
            ],
            userTablesColumns: [
                {key: '2', value: '1', text: 'Главное меню',},
                {key: '3', value: '22', text: 'Товар'}
            ],
            groupsOptions: [
                {key: '1', value: '1', text: 'Главное меню',},
                {key: '2', value: '3', text: 'Магазин товаров'}
            ],

            name: "Menu",
            template: "new",
            createNew: true,
            newButton:true,
            menuID: props.menuID,
            type: props.type,
            buttonID: props.buttonID
        };

    }

    loading=(loading)=>{
        this.setState({
            loading:loading
        })
    };

    componentDidMount() {
        var main = this;
        axios.get(HOST_API + "tables/").then((resp) => {
            var tables = resp.data;
            var userTables = [];
            var userTablesColumns = {};
            for (let t in tables) {
                userTables.push(
                    {key: t, value: tables[t].id, text: tables[t].name}
                );
                userTablesColumns[tables[t].id] = [];
                for (var c in tables[t].columns) {
                    if (tables[t].columns[c].default == false)
                        userTablesColumns[tables[t].id].push(
                            {key: c, value: c, text: tables[t].columns[c].name}
                        )
                }
                console.log("userTablesColumns",userTablesColumns)
            }
            main.setState({
                userTables: userTables,
                userTablesColumns: userTablesColumns
            })
        }).catch((e) => {
            toast.error(JSON.stringify(e.response));
        });
        axios.get(HOST_API + "menus/").then((resp) => {
            console.log("menus", resp.data);
            var groupsOptions = [];

            for (var m in resp.data) {
                groupsOptions.push(
                    {key: m, value: resp.data[m].id, text: resp.data[m].name});
            }
            main.setState({
                groupsOptions: groupsOptions
            })
        });

        axios.get(HOST_API + "buttons/", {params: {all: true}}).then((resp) => {
            console.log("menus", resp.data);
            var btnOptions = [];
            btnOptions.push(
                {key: '1', value: 'new', text: 'New', icon: 'add circle'}
            );
            for (var m in resp.data) {
                btnOptions.push(
                    {key: m, value: resp.data[m].id, text: resp.data[m].name});
            }

            main.setState({
                btnOptions: btnOptions
            })
        });

        if(this.state.buttonID>0) {
            this.loading(true);
            axios.get(HOST_API + "buttons/", {
                params: {
                    btn_id: this.state.buttonID
                }
            }).then((resp) => {
                    main.loading(false);
                    main.setState({
                        ...resp.data.info,
                        template: this.state.buttonID,
                        newButton: false
                    })
                }
            )
        }

    }

    reload(btn) {
        var extend = require('util')._extend;
        this.state = extend(this.state, btn);
        this.forceUpdate();
    }

    changeTemplate = (e, {name, value}) => {
        console.log(this.state.buttonID);

        var main = this;
        if (value !== "new") {
            this.loading(true);
            axios.get(HOST_API + "buttons/", {
                params: {
                    btn_id: value
                }
            }).then((resp) => {
                    main.loading(false);
                    main.setState({
                        ...resp.data.info,
                        template: value,
                        newButton: false,
                        createNew: false,
                        buttonID: value
                    })

                }
            )
        } else {
            this.setState({"newButton": true});
        }

    };

    select = (e, {name, value}) => {
        this.setState({[name]: value});
    };

    input = (e, {name, value}) => {
        console.log(value);
        this.setState({[name]: value});
    };

    setAddition = (e, {name, value}) => {
        this.setState({addition: value});
        this.show();
    };

    saveAddition = () => {
        // axios.post(HOST_API + "upload_photo_file/", this.state.file, {
        //     headers: {
        //         'Content-Type': this.state.file.type
        //     }
        // }).then((r)=>{
        //     console.log(r.data);
        // });
        this.close();
    };

    change = (e, {name}) => {
        this.setState({[name]: this.state[name] ^ 1});
    };

    save = (btn_coord) => {
        var btn = Object.assign({}, this.state);
        if (btn.name === "") {
            toast.error("Name is empty");
            return;
        }
        var main = this;
        console.log("Save");
        delete btn.btnOptions;
        delete btn.userTables;
        delete btn.userTablesColumns;
        delete btn.groupsOptions;
        delete btn.menuID;
        delete btn.buttonID;
        delete btn.newButton;
        delete btn.loading;

        if (this.state.createNew || this.state.template === "new") {
            axios.post(HOST_API + "buttons/",
                {
                    id: this.state.buttonID,
                    info: btn,
                    name: btn.name,
                }).then((resp) => {
                axios.patch(HOST_API + "menus/",
                    {
                        menu_id: main.state.menuID,
                        btn_coord: btn_coord,
                        button_id: resp.data.id
                    }).then((r) => {
                    toast.success(r.data);
                }).catch((e) => {
                    toast.error(JSON.stringify(e.response));
                })
            }).catch((e) => {
                console.log(e);
                toast.error(JSON.stringify(e.response));
            })
        } else {
            axios.patch(HOST_API + "buttons/",
                {
                    id: this.state.buttonID,
                    info: btn,
                    name: btn.name,
                }).then((resp) => {
                    axios.patch(HOST_API + "menus/",
                        {
                            menu_id: main.state.menuID,
                            btn_coord: btn_coord,
                            button_id: main.state.buttonID
                        }).then((r) => {
                        console.log("upsate_btn ", r.data)
                    }).catch((e) => {
                        toast.error(JSON.stringify(e.response));
                    });
                toast.success(resp.data);
            }).catch((e) => {
                toast.error(JSON.stringify(e.response));
            });
        }


    };

    drop = () => {
        axios.delete(HOST_API + "buttons/",
            {
                params: {
                    button_id: this.state.buttonID
                }
            }).then((resp) => {
            toast.success(resp.data);
        }).catch((e) => {
            toast.error(JSON.stringify(e.response));
        });
    };

    show = () => {
        this.setState({openModal: true});
    };

    close = () => this.setState({openModal: false});

    render() {
        const {
            btnOptions, groupsOptions, userTablesColumns, addition,
            textParsing, createNew, userTables, notification, saveInTable, newButton
        } = this.state;

        let useFunk = this.state.funkParams != null && this.state.funkParams != "";
        // console.log(this.state);

        return (

            <Segment attached='bottom'>
                {this.state.loading&&
                <Dimmer active inverted>
                    <Loader inverted>Loading</Loader>
                </Dimmer>}

                <Modal size={"mini"} open={this.state.openModal} onClose={this.close}>
                    <Modal.Header>Сhoose File</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Group>
                                <Form.Input widths={16}
                                            name={"file"}
                                            value={this.state.value}
                                            onChange={this.input}
                                            placeholder='https://toster.ru/q/534793.png'/>
                                {/*<Form.Input onChange={this.input} type="file" width={11} fluid*/}
                                {/*name={"file"}/>*/}
                                <Form.Button
                                    widths={4}
                                    onClick={this.saveAddition}
                                    color={"green"}
                                >Save</Form.Button>
                            </Form.Group>
                        </Form>
                    </Modal.Content>
                </Modal>
                <Form>
                    <Form.Group widths='equal'>
                        <Form.Input fluid label='Label' value={this.state.name}
                                    name={"name"} onChange={this.input}
                                    disabled={!newButton && !createNew} placeholder='Menu'/>
                        <Form.Select
                            fluid
                            name={"template"}
                            label='Template'
                            options={btnOptions}
                            value={this.state.template}
                            onChange={this.changeTemplate}
                        />
                    </Form.Group>
                    {this.state.type > 0 &&
                    <Form.Field>
                        <Input fluid value={this.state.callback}
                               label={<Dropdown name={"calBackType"} onSelect={this.select} defaultValue='0' options={[
                                   {key: '1', value: '0', text: 'data',},
                                   {key: '2', value: '1', text: 'url'}
                               ]}/>}
                               labelPosition='right'
                               name={"callback"} onChange={this.input} placeholder='Callback'/>
                    </Form.Field>
                    }
                    <Form.Group>
                        <Form.Radio fluid name={'levelPermit'} onChange={this.change} label='Only for level'
                                    toggle checked={this.state.levelPermit} width={12}/>
                        <Form.Input
                            width={4}
                            fluid
                            type={"number"}
                            min={0}
                            max={10}
                            disabled={!this.state.levelPermit}
                            name={"constLevel"}
                            value={this.state.constLevel}
                            onChange={this.input}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Radio fluid name={'changePermit'} onChange={this.change} label='Change user level'
                                    toggle checked={this.state.changePermit} width={12}/>
                        <Form.Input
                            width={4}
                            fluid
                            type={"number"}
                            min={0}
                            max={10}
                            disabled={!this.state.changePermit}
                            name={"newLevel"}
                            value={this.state.newLevel}
                            onChange={this.input}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Radio fluid name={'saveInTable'} onChange={this.change} label='Save in table'
                                    toggle checked={this.state.saveInTable} width={6}/>
                        <Form.Select
                            width={5}
                            fluid
                            disabled={!saveInTable}
                            name={"tableName"}
                            value={this.state.tableName}
                            options={userTables}
                            onChange={this.select}
                        />
                        <Form.Select
                            width={5}
                            fluid
                            disabled={!saveInTable}
                            name={"columnName"}
                            options={userTablesColumns[this.state.tableName]}
                            value={this.state.columnName}
                            onChange={this.select}
                        />
                    </Form.Group>
                    {saveInTable ?
                        <Form.Field>
                            <Form.Input
                                name={"tableRowValue"}
                                value={this.state.tableRowValue}
                                label={"data for saving"}
                                onChange={this.input}
                            />
                            <Form.Checkbox label='Добавить к последней записи этого пользователя'
                                           checked={this.state.editRow}
                                           onChange={this.change} name={"editRow"}/>
                        </Form.Field> : null
                    }
                    <Form.Group>
                        <Form.Radio fluid name={'notification'} onChange={this.change} label='Notification'
                                    toggle checked={this.state.notification} width={6}/>

                    </Form.Group>
                    {notification ?
                        <Form.TextArea label='Notification text'
                                       name={"notificationText"}
                                       onChange={this.input}
                                       value={this.state.notificationText}
                                       placeholder='Пользователь %USER% добавил новый товар'/> : null

                    }
                    <Form.Group>
                        <Form.Radio fluid name={'changeGroup'} onChange={this.change} label='Change group'
                                    toggle checked={this.state.changeGroup} width={8}/>
                        <Form.Select
                            width={8}
                            fluid
                            disabled={!this.state.changeGroup}
                            value={this.state.newGroupId}
                            name={"newGroupId"}
                            options={groupsOptions}
                            onChange={this.select}
                        />
                    </Form.Group>
                    <Form.TextArea disabled={useFunk} label='Response'
                                   name={"response"}
                                   value={this.state.response}
                                   onChange={this.input}
                                   placeholder='С вами скоро свяжется оператор'/>
                    <Form.Group inline widths={"4"}>
                        <label>Parse Mode:</label>
                        <Form.Radio disabled={useFunk}
                                    name={"textParsing"}
                                    label='None'
                                    value='no'
                                    checked={textParsing === 'no'}
                                    onChange={this.select}
                        />
                        <Form.Radio disabled={useFunk}
                                    name={"textParsing"}
                                    label='Markdown'
                                    value='markdown'
                                    checked={textParsing === 'markup'}
                                    onChange={this.select}
                        />
                        <Form.Radio disabled={useFunk}
                                    name={"textParsing"}
                                    label='HTML'
                                    value='HTML'
                                    checked={textParsing === 'html'}
                                    onChange={this.select}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Button.Group basic fluid size='large'>
                            {
                                ["file", "photo", "video", "microphone"].map((label) => {
                                    if (addition == label) {
                                        return (<Button name={"addition"} active secondary
                                                        value={label} icon={label} onClick={this.input}/>)
                                    } else
                                        return (<Button name={"addition"} disabled={useFunk}
                                                        value={label} icon={label} onClick={this.setAddition}/>)
                                })
                            }
                        </Button.Group>
                    </Form.Group>

                    <Form.Input name={"funkParams"} onChange={this.input} value={this.state.funkParams}
                                placeholder='-f start menu' label={"Answer from function"}/>

                    <Form.Checkbox label='Создать новый элемент с этими параметрами'
                                   disabled={newButton} checked={createNew}
                                   onChange={this.change} name={"createNew"}/>

                </Form>
            </Segment>
        )

    }
}

