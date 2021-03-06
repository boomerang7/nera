import React, {useEffect, useState} from 'react';
import {PageInfo, AssignmentBox, Loading} from "../components";
import { getMajorStr } from '../shared/MajorDictionary';

import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { Grid } from '@material-ui/core';
import axios from "axios";
import { useHistory } from "react-router-dom";
import { getUserInfo } from "../shared/GetUserInfo";

const Home = (props)=>{
    const [PAssignment, setPA] = useState(undefined); // progress
    const [FAssignment, setFA] = useState(undefined); // finish
    const [user, setUser] = useState(undefined);
    const history = useHistory();

    function getCookie(name) {
        let value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        return value ? value[2] : null;
    };

    function getSubTitle() {
        if (user.type === 0)
            return `교수 / ${user.userNumber}`;
        else
            return `학생 / ${user.userNumber} / ${user.major}`;
    }

    useEffect(() => {
        try {
            setUser(getUserInfo());
        } catch (err) {
            history.push("/");
        }

        axios.get('/v1/assignment', { withCredentials: true })
            .then(res => {
                let assign = res.data;
                let pAssign = [], fAssign = [];
                console.log(assign);

                for (let i = 0; i < assign.length; i++) {
                    switch (assign[i].assignmentState) {
                        case 0:
                        case 1:
                            pAssign.push(assign[i]);
                            break;

                        case 2:
                            fAssign.push(assign[i]);
                            break;

                        case 3:
                            if (user.type === 1)
                                fAssign.push(assign[i]);
                            break;
                    }
                }

                setPA(pAssign);
                setFA(fAssign);
            })
            .catch(err => {
                const status = err?.response?.status;
                if (status === undefined) {
                    alert("예기치 못한 예외가 발생하였습니다.\n"+JSON.stringify(err));
                }
                else if (status === 400) {
                    alert(`과제 정보를 얻는데 실패하였습니다. 잘못된 요청입니다. (${status})`);
                }
                else if (status === 401) {
                    history.push("/");
                }
                else if (status === 404) {
                    alert("과제를 찾을 수 없습니다.");
                }
                else if (status === 500) {
                    alert("내부 서버 오류입니다. 잠시 후에 다시 시도해주세요...");
                }
                history.push("/");
            })
    }, []);

        /*
        const result = asInfo.map((as)=>{
            if(type===0){ // 교수 => 0, 1이 마감 전 0 => 발행전, 1 => 진행 중
                switch(as[3]){
                    case 0:
                        PAssignment.push(as);
                        break;
                    case 1:
                        PAssignment.push(as);
                        break;
                    case 2:
                        FAssignment.push(as);
                        break;
                }
            }else if(type===1){ // 학생 => 0, 1이 마감 전
                switch(as[3]){
                    case 0:
                        PAssignment.push(as);
                        break;
                    case 1:
                        PAssignment.push(as);
                        break;
                    case 2:
                        FAssignment.push(as);
                        break;
                    case 3:
                        FAssignment.push(as);
                        break;
                }
            }
        });
        setPA(asInfo);*/

    // state가 아직 로드되지 않았다면 렌더링 안 함.
    if (PAssignment === undefined || FAssignment === undefined)
        return (<Loading status="과제 정보를 가져오는 중..."></Loading>)
    else
        return (
            <Grid container direction="column">
                <PageInfo className="account_info"
                    icon={AccountCircleIcon}
                    mainTitle={user.userName}
                    subTitle={getSubTitle()}
                />
                <Grid container direction="column" className="contents_con">
                    <Grid className="contents_title"><h6>{user.type === 0 ? "마감 전 과제" : "제출 가능한 과제" // 제목 수정 필요
                    }</h6></Grid>
                    <Grid className="assignment_rootbox">
                        {
                            PAssignment.map((as) =>
                                <AssignmentBox
                                    type={user.type}
                                    as_info={as}
                                    key={as[2]}
                                />
                            )
                        }
                    </Grid>
                </Grid>
                <Grid container direction="column" className="contents_con">
                    <Grid className="contents_title"><h6>마감된 과제</h6></Grid>
                    <Grid className="assignment_rootbox">
                        {
                            FAssignment.map((as) =>
                                <AssignmentBox
                                    type={user.type}
                                    as_info={as}
                                    key={as[2]}
                                />
                            )
                        }
                    </Grid>
                </Grid>
            </Grid>
        )
}

export default Home