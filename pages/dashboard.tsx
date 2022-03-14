
import { useEffect, useState } from 'react';
import { withRouter } from 'next/router'
import { useRootPageContext, IRootPageState } from "../components/states/RootState"
import {MainSideBar} from '../components/page/sidebar'
import { TopBar } from '../components/page/topbar'
import { Footer } from '../components/page/pageFooter'
import {OriginalDashboard} from './origDashboard'

export default withRouter(function MainDashboard(props) {
  //const { state, setMainState } = props;  
  const rstate = useRootPageContext();
  //const [pageState, setPageState] = pstate;
  
  return (
    
    <div id="page-top">
      <div id="wrapper">
        <MainSideBar></MainSideBar>
        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <TopBar/>            
            <OriginalDashboard/>
          </div>
          <Footer />
        </div>
      </div>                    
    </div>
  )
});

/*
<a className="scroll-to-top rounded" href="#page-top">
        <i className="fas fa-angle-up"></i>
      </a>

                
      <div className="modal fade" id="logoutModal" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Ready to Leave?</h5>
              <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">Select "Logout" below if you are ready to end your current session.</div>
            <div className="modal-footer">
              <button className="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
              <a className="btn btn-primary" href="login.html">Logout</a>
            </div>
          </div>
        </div>
      </div>
*/