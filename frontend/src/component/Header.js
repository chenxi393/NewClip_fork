/**
 * @file Header组件，包含导航栏，搜索框，上传，私信，登录按钮或个人信息头像
 * @module Header
 */
import { Link } from 'react-router-dom';
import styles from '../assets/styles/Header.module.less';
import { FiUpload } from 'react-icons/fi';
import { Modal, Form, Input, Button, message, Popover } from 'antd';
import { useEffect, useState } from 'react';
import { BiShare, BiSearchAlt2 } from 'react-icons/bi';
import { AiOutlineHeart, AiOutlineMessage, AiOutlineMore } from 'react-icons/ai';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { login, register } from '../utils/loginRegister';
import { useNavigate } from 'react-router-dom';
import getPersonalInfo from '../utils/getPersonalInfo';
import PersonalPopover from './PersonalPopover';
import MessagePopover from './MessagePopover';
import { loginFailure, loginRequest, loginSuccess, logOut, registerFailure, registerRequest, registerSuccess } from '../redux/actions/loginRegisterAction';
import { getFriendList, getMessages } from '../utils/getMessage';
import UploadPopover from './UploadPopover';
/**
 * Header组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.visible - 登录modal是否可见
 * @param {function} props.handleModal - 登录modal的显示/隐藏函数
 * @param {function} props.setChooseClass - 设置主页视频的类别
 * @param {string} props.chooseClass - 视频选择的类别
 * @returns {JSX.Element} Header组件
 */
function Header({ visible, handleModal, setChooseClass, chooseClass }) {
    /**
     * 登录注册选择状态
     * @type {Array}
     */
    const [choose, setChoose] = useState([true, false]);
    /**
     * 搜索框内容
     * @type {string}
     */
    const [search, setSearch] = useState('');
    /**
     * 个人信息
     * @type {Object}
     */
    const [info, setInfo] = useState(localStorage.getItem("info") ? JSON.parse(localStorage.getItem("info")) : null);
    /**
     * 是否登出
     * @type {boolean}
     */
    const logout = useSelector(state => state?.loginRegister?.logout);
    /**
     * 是否正在登录
     * @type {boolean}
     */
    const loginWaiting = useSelector(state => state?.loginRegister?.loginWaiting);
    /**
     * 是否正在注册
     * @type {boolean}
     */
    const registerWaiting = useSelector(state => state?.loginRegister?.registerWaiting);
    /**
     * 个人页popover是否可见
     * @type {boolean}
     */
    const [visiblePopover, setVisiblePopover] = useState(false);
    /**
     * 用户id
     * @type {string}
     */
    const id = useSelector(state => state?.loginRegister?.user_id);
    /**
     * 用户token
     * @type {string}
     */
    const token = useSelector(state => state?.loginRegister?.token);
    /**
     * 私信页popover是否可见
     * @type {boolean}
     */
    const [messageVisible, setMessageVisible] = useState(false);
    /**
     * 上传视频页popover是否可见
     * @type {boolean}
     */
    const [uploadVisible, setUploadVisible] = useState(false);
    /**
     * 路由导航
     * @type {function}
     */
    const navigate = useNavigate();
    /**
     * redux dispatch函数
     * @type {function}
     */
    const dispatch = useDispatch();
    /**
     * 获取个人信息
     * @param {string} id - 用户id
     * @param {string} token - 用户token
     */
    useEffect(() => {
        getPersonalInfo(id, token).then(res => {
            switch (res.status_code) {
                case 0:
                    localStorage.setItem("info", JSON.stringify(res.user));
                    setInfo(res.user);
                    break;
                case -1:
                    console.log(res.status_msg);
                    break;
                default:
                    break;
            }
        }).catch(err => {
            console.log(err);
        })
        const friendList = localStorage.getItem("friend_list") ? JSON.parse(localStorage.getItem("friend_list")) : undefined;
        if (friendList) {
            for (let i = 0; i < friendList.length; i++) {
                getMessages(token, friendList[i].id).then(res => {
                    switch (res.status_code) {
                        case 0:
                            let messages = localStorage.getItem('messages')===undefined ? JSON.parse(localStorage.getItem('messages')):{};
                            messages[friendList[i].id] = res.message_list;
                            localStorage.setItem('messages', JSON.stringify(messages));
                            break;
                        case -1:
                            console.log(res.status_msg);
                            break;
                        default:
                            break;
                    }
                })

            }
        }
    }, [id, token, visiblePopover])
    /**
     * 登录表单提交函数
     * @param {Object} values - 表单值
     * @param {string} values.username - 用户名
     * @param {string} values.password - 密码
     */
    function onFinishLogin(values) {
        dispatch(loginRequest());
        message.loading({
            content: '登录中...',
            key: 'loginWaiting',
            duration: 0
        })
        login(values.username, values.password).then((res) => {
            message.destroy();
            switch (res.status_code) {
                case 0:
                    message.success({
                        content: res.status_msg,
                        key: 'loginSuccess',
                        duration: 2
                    })
                    dispatch(loginSuccess(values.username, res.token, res.status_msg, res.user_id));
                    localStorage.setItem("token", res.token);
                    getFriendList(res.user_id, res.token).then(res => {
                        switch (res.status_code) {
                            case 0:
                                localStorage.setItem("friend_list", JSON.stringify(res.user_list));
                                break;
                            case -1:
                                console.log(res.status_msg);
                                break;
                            default:
                                break;
                        }
                    })
                    handleModal();
                    break;
                case -1:
                    message.error({
                        content: res.status_msg,
                        key: 'loginFailure',
                        duration: 2
                    })
                    dispatch(loginFailure(res.status_msg));
                    break;
                default:
                    break;
            }
        }).catch((err) => {
            message.destroy();
            message.error("登录失败，请检查网络连接");
            console.log(err);
            dispatch(loginFailure(err));
        })
    }
    /**
     * 注册表单提交函数
     * @param {Object} values - 表单值
     * @param {string} values.username - 用户名
     * @param {string} values.password - 密码
     */
    function onFinishRegister(values) {
        dispatch(registerRequest());
        message.loading({
            content: '注册中...',
            key: 'registerWaiting',
            duration: 0
        })
        register(values.username, values.password).then((res) => {
            message.destroy();
            switch (res.status_code) {
                case 0:
                    message.success({
                        content: res.status_msg,
                        key: 'registerSuccess',
                        duration: 2
                    })
                    dispatch(registerSuccess(res.status_msg));
                    break;
                case -1:
                    message.error({
                        content: res.status_msg,
                        key: 'registerFailure',
                        duration: 2
                    })
                    dispatch(registerFailure(res.status_msg));
                    break;
                default:
                    break;
            }
        }).catch((err) => {
            message.destroy();
            message.error("注册失败，请检查网络连接");
            console.log(err);
            dispatch(registerFailure(err));
        })
    }
    function onFinishFailed(errorInfo) {
        console.log('Failed:', errorInfo);
    }
    function handleLogout() {
        dispatch(logOut());
    }
    function handleSearch() {
        if (search !== "") {
            if(search.length<2){
                message.warning("请至少输入两个字！")
                return;
            }
            navigate('/search?keyword=' + search);
            setSearch('');
        }
    }
    function handleKeydown(e) {
        if (e.key === "Enter") {
            handleSearch();
        }
    }
    function handleFileChange() {//控制开启关闭上传popover
        if (logout) {
            message.error("请先登录");
            handleModal();
            setUploadVisible(false);
            return;
        }
        setUploadVisible(!uploadVisible);
    }
    function handleMessage() {//控制开启关闭私信popover
        if (logout) {
            message.error("请先登录");
            handleModal();
            setMessageVisible(false);
            return;
        }
        setMessageVisible(!messageVisible);
    }
    return (
        <header>
            <div className={styles.headerContainer}>
                <div className={styles.header}>
                    <div className={styles.brand}>
                        <Link className={styles.link} to="https://github.com/chenxi393/NewClip">NewClip</Link>
                    </div>
                    <nav className={styles.navlinks}>
                        <Link className={`${styles.link} ${chooseClass === 0 && styles.choose}`} to="/" onClick={() => setChooseClass(0)}>首页</Link>
                        <Link className={`${styles.link} ${chooseClass === 1 && styles.choose}`} to='/' onClick={() => setChooseClass(1)}>体育</Link>
                        <Link className={`${styles.link} ${chooseClass === 2 && styles.choose}`} to='/' onClick={() => setChooseClass(2)}>游戏</Link>
                        <Link className={`${styles.link} ${chooseClass === 3 && styles.choose}`} to='/' onClick={() => setChooseClass(3)}>音乐</Link>
                    </nav>
                    <div className={styles.searchInput}>
                        <input type="text" placeholder="请输入搜索关键词" value={search} onChange={(e) => { setSearch(e.target.value) }} onKeyDown={handleKeydown} />
                        <div className={styles.searchIcon} onClick={handleSearch}>
                            <BiSearchAlt2></BiSearchAlt2>
                        </div>
                    </div>
                    <div className={styles.personalbar}>
                        <Popover open={uploadVisible} onClick={()=>handleFileChange()} content={<UploadPopover handleUpload={handleFileChange}></UploadPopover>}>
                            <div className={styles.upload} onClick={handleFileChange}>
                                <div><FiUpload></FiUpload></div>
                                <div className={styles.uploadText}>上传</div>
                            </div>
                        </Popover>
                        <Popover content={<MessagePopover handleMessage={handleMessage}></MessagePopover>} open={messageVisible} onClick={() => handleMessage()}>
                            <div className={styles.message}>
                                <div><AiOutlineMessage></AiOutlineMessage></div>
                                <div className={styles.messageText}>私信</div>
                            </div>
                        </Popover>
                        <div className={styles.more}>
                            <div><AiOutlineMore></AiOutlineMore></div>
                            <div className={styles.moreText}>更多</div>
                        </div>
                    </div>
                    <div className={styles.person}>
                        {logout ?
                            <div className={styles.personal}>
                                <div className={styles.login} onClick={handleModal}>登录</div>
                            </div> :
                            (info &&
                                <Popover content={<PersonalPopover info={info} handleLogout={handleLogout} />}
                                    placement="bottomRight" trigger="hover" onOpenChange={() => setVisiblePopover(!visiblePopover)}>
                                    <div className={styles.avatar} style={{
                                        backgroundImage: `url(${info.avatar})`,
                                        backgroundSize: 'cover',
                                    }} onClick={() => { navigate('/personal') }}>
                                    </div>
                                </Popover>
                            )
                        }
                    </div>
                </div>
            </div>
            <Modal
                open={visible}
                onCancel={handleModal}
                footer={null}
                className={styles.modal}
            >
                <div className={styles.modalContainer}>
                    <div className={styles.titleContainer}>
                        <div className={styles.modalTitle}>登录后畅享更多精彩</div>
                        <div>
                            <div className={styles.modalTitleSmall}>
                                <div className={styles.icon}><BiShare /></div>一键分享视频给好友
                            </div>
                            <div className={styles.modalTitleSmall}>
                                <div className={styles.icon}><AiOutlineHeart /></div>点赞评论随心发
                            </div>
                        </div>

                    </div>
                    <div className={styles.choose}>
                        <div className={`${styles.chooseItem} ${choose[0] && styles.choosed}`} onClick={() => {
                            setChoose([true, false]);
                        }}>登录</div>
                        <div className={`${styles.chooseItem} ${choose[1] && styles.choosed}`} onClick={() => {
                            setChoose([false, true]);
                        }}>注册</div>
                    </div>
                    {choose[0] &&
                        <Form
                            name="complex-form"
                            onFinish={onFinishLogin}
                            onFinishFailed={onFinishFailed}
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 16 }}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                marginTop: "20px",
                
                            }}
                        >
                            <Form.Item
                                label={<span style={{ color: "#C9C9CA" }}>用户名</span>}
                                name="username"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入用户名!',
                                    },
                                ]}
                            >
                                <Input className={styles.input} />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ color: "#C9C9CA" }}>用户密码</span>}
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入用户密码!',
                                    },
                                ]}
                            >
                                <Input.Password className={styles.input} />
                            </Form.Item>

                            <Form.Item
                                wrapperCol={{
                                    offset: 8,
                                    span: 16,
                                }}
                                style={{
                                    width: "100%",
                                }}
                            >
                                <Button type='primary' htmlType='submit' disabled={loginWaiting}>登录</Button>
                            </Form.Item>
                        </Form>}
                    {
                        choose[1] &&
                        <Form
                            name="complex-form"
                            onFinish={onFinishRegister}
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 16 }}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                marginTop: "20px",
                            }}
                        >
                            <Form.Item
                                label={<span style={{ color: "#C9C9CA" }}>用户名</span>}
                                name="username"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入用户名!',
                                    },
                                    {
                                        max: 32,
                                        message: '用户名长度不能超过32位'
                                    }
                                ]}
                            >
                                <Input className={styles.input} />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ color: "#C9C9CA" }}>用户密码</span>}
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入用户密码!',
                                    },
                                    {
                                        min: 6,
                                        message: '密码长度不能小于6位'
                                    }
                                ]}
                            >
                                <Input.Password className={styles.input} />
                            </Form.Item>

                            <Form.Item
                                wrapperCol={{
                                    offset: 8,
                                    span: 16,
                                }}
                                style={{
                                    width: "100%",
                                }}
                            >
                                <Button htmlType='submit' disabled={registerWaiting}>注册</Button>
                            </Form.Item>
                        </Form>
                    }
                </div>
            </Modal>
        </header>
    )
}

export default Header;