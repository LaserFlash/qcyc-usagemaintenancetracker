import { Injectable } from '@angular/core';
import { BreakageInfo } from './objects/breakageInfo';
import { AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';


@Injectable()
export class BoatBreakageService {
  public items: BreakageInfo[] =[];
  public recentItems: BreakageInfo[] =[];

  private itemsData: FirebaseListObservable<BreakageInfo[]>;
  private recentThreeItems: FirebaseListObservable<BreakageInfo[]>;
  constructor(private db: AngularFireDatabase) {
    this.itemsData = db.list('/issues');
    this.itemsData.subscribe(val => { this.buildBreakages(val,this.items); });
    this.recentThreeItems = db.list('/issues', {
      query: {
        limitToLast: 3,
        orderByChild: 'timestamp'
      }
    })
    this.recentThreeItems.subscribe(val => { this.buildBreakages(val, this.recentItems); });

  }

  addBreakageInfo(breakage: BreakageInfo) {
    return Promise.resolve(this.itemsData.push(
      {
        name: breakage.name,
        contact: breakage.contact,
        boatID: breakage.boatID,
        importance: breakage.importance,
        details: breakage.details,
        timestamp: breakage.timestamp.getTime()
      }
    ));
  }

  remove(key){
    this.itemsData.remove(key);
  }

  private buildBreakages(val: BreakageInfo[], array: BreakageInfo[]) {
        array.length = 0;
        val.forEach(element => {
            array.push(element);
        });
    }
}
